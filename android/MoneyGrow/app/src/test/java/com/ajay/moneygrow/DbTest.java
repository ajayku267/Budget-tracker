package com.ajay.moneygrow;

import android.content.ContentValues;
import android.content.Context;
import android.database.Cursor;
import android.database.sqlite.SQLiteDatabase;

import org.junit.After;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.robolectric.RobolectricTestRunner;
import org.robolectric.RuntimeEnvironment;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.nio.charset.StandardCharsets;

import static org.junit.Assert.*;

@RunWith(RobolectricTestRunner.class)
public class DbTest {
    private Context context;
    private Db db;

    @Before
    public void setUp() {
        context = RuntimeEnvironment.getApplication();
        context.deleteDatabase("moneygrow.db");
        db = new Db(context);
        db.getWritableDatabase();
    }

    @After
    public void tearDown() {
        if (db != null) db.close();
        context.deleteDatabase("moneygrow.db");
    }

    @Test
    public void rejectsInvalidAmountsAndDuplicateFingerprints() {
        assertFalse(db.add("Zero", 0, false, "Food", "Manual", "zero"));
        assertFalse(db.add("Negative", -5, false, "Food", "Manual", "negative"));
        assertFalse(db.add("NaN", Double.NaN, false, "Food", "Manual", "nan"));
        assertFalse(db.add("Infinite", Double.POSITIVE_INFINITY, false, "Food", "Manual", "infinite"));
        assertTrue(db.add("Lunch", 120, false, "Food", "Manual", "same-id"));
        assertFalse(db.add("Lunch duplicate", 120, false, "Food", "Manual", "same-id"));
        assertEquals(120d, db.total(false), 0.001);
    }

    @Test
    public void totalsAndCurrentMonthExpensesUseSavedTransactions() {
        assertTrue(db.add("Salary", 25000, true, "Salary", "Manual", "salary"));
        assertTrue(db.add("Rent", 7000, false, "Home", "Manual", "rent"));
        assertTrue(db.add("Groceries", 1500, false, "Food", "Manual", "groceries"));

        assertEquals(25000d, db.total(true), 0.001);
        assertEquals(8500d, db.total(false), 0.001);
        assertEquals(8500d, db.currentMonthExpenses(), 0.001);
    }

    @Test
    public void transfersAreExcludedFromIncomeAndExpenseTotals() {
        assertTrue(db.add("Salary", 30000, true, "Salary", "Manual", "salary-transfer-test"));
        assertTrue(db.add("Rent", 8000, false, "Home", "Manual", "rent-transfer-test"));
        assertTrue(db.addTransfer(5000, "Current account", "Savings"));
        assertFalse(db.addTransfer(500, "Savings", " savings "));
        assertFalse(db.addTransfer(500, "Cash", ""));
        assertEquals(30000d, db.total(true), 0.001);
        assertEquals(8000d, db.total(false), 0.001);
        Cursor c = db.getReadableDatabase().rawQuery(
                "SELECT is_transfer,transfer_from,transfer_to FROM tx WHERE category='Transfer'", null);
        try {
            assertTrue(c.moveToFirst());
            assertEquals(1, c.getInt(0));
            assertEquals("Current account", c.getString(1));
            assertEquals("Savings", c.getString(2));
        } finally { c.close(); }
    }

    @Test
    public void backupRoundTripRestoresTransactionsAndFingerprints() throws Exception {
        assertTrue(db.add("Salary", 25000, true, "Salary", "Manual", "salary"));
        assertTrue(db.add("Lunch", 180, false, "Food", "com.example.pay", "payment-1"));
        assertTrue(db.addTransfer(1000, "Wallet", "Savings"));

        ByteArrayOutputStream output = new ByteArrayOutputStream();
        db.writeBackup(output);
        assertTrue(output.toString("UTF-8").contains("\"formatVersion\": 1"));

        assertTrue(db.add("Temporary", 50, false, "Other", "Manual", "temporary"));
        int restored = db.restoreBackup(new ByteArrayInputStream(output.toByteArray()));

        assertEquals(3, restored);
        assertEquals(25000d, db.total(true), 0.001);
        assertEquals(180d, db.total(false), 0.001);
        Cursor transfer = db.getReadableDatabase().rawQuery("SELECT is_transfer FROM tx WHERE category='Transfer'", null);
        try { assertTrue(transfer.moveToFirst()); assertEquals(1, transfer.getInt(0)); }
        finally { transfer.close(); }
        assertFalse(db.add("Duplicate after restore", 180, false, "Food", "com.example.pay", "payment-1"));
    }

    @Test
    public void invalidBackupDoesNotDeleteExistingTransactions() throws Exception {
        assertTrue(db.add("Keep me", 75, false, "Food", "Manual", "keep"));

        String invalid = "{\"app\":\"MoneyGrow\",\"formatVersion\":1,\"transactions\":[{" +
                "\"id\":1,\"amount\":-100,\"income\":0}]}";
        try {
            db.restoreBackup(new ByteArrayInputStream(invalid.getBytes(StandardCharsets.UTF_8)));
            fail("Expected invalid transaction to be rejected");
        } catch (IllegalArgumentException expected) {
            // Validation must happen before the replacement transaction begins.
        }

        assertEquals(75d, db.total(false), 0.001);
        Cursor c = db.all();
        try {
            assertEquals(1, c.getCount());
        } finally {
            c.close();
        }
    }


    @Test
    public void importedPaymentsRequireReviewAndCanBeMarkedReviewed() {
        assertTrue(db.add("UPI payment", 250, false, "UPI · review", "com.example.pay", "import-1"));
        assertEquals(1, db.pendingReviewCount());
        assertTrue(db.markReviewed(1));
        assertEquals(0, db.pendingReviewCount());
        assertFalse(db.markReviewed(1));
    }

    @Test
    public void migratesVersionOneDatabaseWithoutLosingTransactions() {
        db.close();
        db = null;
        context.deleteDatabase("moneygrow.db");

        SQLiteDatabase legacy = context.openOrCreateDatabase("moneygrow.db", Context.MODE_PRIVATE, null);
        legacy.execSQL("CREATE TABLE tx(id INTEGER PRIMARY KEY AUTOINCREMENT,title TEXT,amount REAL,income INTEGER,category TEXT,date TEXT,source TEXT,fingerprint TEXT UNIQUE)");
        ContentValues row = new ContentValues();
        row.put("title", "Legacy lunch");
        row.put("amount", 90d);
        row.put("income", 0);
        row.put("category", "Food");
        row.put("date", "14 Oct 2026, 12:00");
        row.put("source", "Manual");
        row.put("fingerprint", "legacy-1");
        legacy.insertOrThrow("tx", null, row);
        legacy.setVersion(1);
        legacy.close();

        db = new Db(context);
        Cursor c = db.getReadableDatabase().rawQuery(
                "SELECT title, timestamp_ms FROM tx WHERE fingerprint=?", new String[]{"legacy-1"});
        try {
            assertTrue(c.moveToFirst());
            assertEquals("Legacy lunch", c.getString(0));
            assertTrue("Legacy timestamp should be backfilled", c.getLong(1) > 0);
        } finally {
            c.close();
        }
    }
}
