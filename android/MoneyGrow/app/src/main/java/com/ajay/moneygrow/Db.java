package com.ajay.moneygrow;

import android.content.ContentValues;
import android.content.Context;
import android.database.Cursor;
import android.database.sqlite.SQLiteDatabase;
import android.database.sqlite.SQLiteOpenHelper;
import org.json.JSONArray;
import org.json.JSONObject;
import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.io.OutputStream;
import java.nio.charset.StandardCharsets;
import java.util.HashSet;
import java.util.Set;

import java.text.ParsePosition;
import java.text.SimpleDateFormat;
import java.util.Calendar;
import java.util.Date;
import java.util.Locale;
import java.util.TimeZone;

public class Db extends SQLiteOpenHelper {
    private static final int DATABASE_VERSION = 4;
    private static final String DATE_PATTERN = "dd MMM yyyy, HH:mm";

    public Db(Context c) {
        super(c, "moneygrow.db", null, DATABASE_VERSION);
    }

    @Override
    public void onCreate(SQLiteDatabase d) {
        d.execSQL("CREATE TABLE tx(" +
                "id INTEGER PRIMARY KEY AUTOINCREMENT," +
                "title TEXT," +
                "amount REAL," +
                "income INTEGER," +
                "category TEXT," +
                "date TEXT," +
                "source TEXT," +
                "fingerprint TEXT UNIQUE," +
                "timestamp_ms INTEGER NOT NULL DEFAULT 0," +
                "reviewed INTEGER NOT NULL DEFAULT 1," +
                "is_transfer INTEGER NOT NULL DEFAULT 0," +
                "transfer_from TEXT," +
                "transfer_to TEXT)");
    }

    @Override
    public void onUpgrade(SQLiteDatabase d, int oldVersion, int newVersion) {
        if (oldVersion < 2) {
            d.execSQL("ALTER TABLE tx ADD COLUMN timestamp_ms INTEGER NOT NULL DEFAULT 0");
            backfillLegacyTimestamps(d);
        }
        if (oldVersion < 3) {
            d.execSQL("ALTER TABLE tx ADD COLUMN reviewed INTEGER NOT NULL DEFAULT 1");
        }
        if (oldVersion < 4) {
            d.execSQL("ALTER TABLE tx ADD COLUMN is_transfer INTEGER NOT NULL DEFAULT 0");
            d.execSQL("ALTER TABLE tx ADD COLUMN transfer_from TEXT");
            d.execSQL("ALTER TABLE tx ADD COLUMN transfer_to TEXT");
        }
    }

    /*
     * Older app versions stored a localized display date only. Keep that value
     * unchanged for existing screens/exports, and add a machine-readable time
     * for correct month-boundary queries. Unparseable legacy rows remain at 0
     * and are included by the legacy-date fallback in currentMonthExpenses().
     */
    private void backfillLegacyTimestamps(SQLiteDatabase d) {
        Cursor cursor = d.query("tx", new String[]{"id", "date"}, null, null, null, null, null);
        try {
            while (cursor.moveToNext()) {
                long parsed = parseLegacyDate(cursor.getString(1));
                if (parsed > 0) {
                    ContentValues values = new ContentValues();
                    values.put("timestamp_ms", parsed);
                    d.update("tx", values, "id=?", new String[]{String.valueOf(cursor.getLong(0))});
                }
            }
        } finally {
            cursor.close();
        }
    }

    private long parseLegacyDate(String value) {
        if (value == null || value.trim().isEmpty()) return 0L;
        Locale[] locales = new Locale[]{Locale.getDefault(), Locale.US};
        for (Locale locale : locales) {
            SimpleDateFormat format = new SimpleDateFormat(DATE_PATTERN, locale);
            format.setLenient(false);
            ParsePosition position = new ParsePosition(0);
            Date parsed = format.parse(value, position);
            if (parsed != null && position.getIndex() == value.length()) return parsed.getTime();
        }
        return 0L;
    }

    public synchronized boolean add(String title, double amount, boolean income, String category,
                                    String source, String fingerprint) {
        if (amount <= 0 || Double.isNaN(amount) || Double.isInfinite(amount)) return false;
        ContentValues v = new ContentValues();
        v.put("title", title == null ? "" : title.trim());
        v.put("amount", amount);
        v.put("income", income ? 1 : 0);
        v.put("category", category == null ? "Other" : category);
        v.put("date", new SimpleDateFormat(DATE_PATTERN, Locale.getDefault()).format(new Date()));
        v.put("source", source == null ? "Manual" : source);
        v.put("fingerprint", fingerprint);
        v.put("timestamp_ms", System.currentTimeMillis());
        v.put("reviewed", source == null || "Manual".equalsIgnoreCase(source) ? 1 : 0);
        v.put("is_transfer", 0);
        return getWritableDatabase().insertWithOnConflict(
                "tx", null, v, SQLiteDatabase.CONFLICT_IGNORE) != -1;
    }

    public Cursor all() {
        return getReadableDatabase().rawQuery(
                "SELECT id,title,amount,income,category,date,source,reviewed,is_transfer,transfer_from,transfer_to FROM tx ORDER BY id DESC", null);
    }

    public double total(boolean income) {
        Cursor c = getReadableDatabase().rawQuery(
                "SELECT COALESCE(SUM(amount),0) FROM tx WHERE income=? AND is_transfer=0",
                new String[]{income ? "1" : "0"});
        try {
            return c.moveToFirst() ? c.getDouble(0) : 0d;
        } finally {
            c.close();
        }
    }

    public double currentMonthExpenses() {
        Calendar start = Calendar.getInstance();
        start.set(Calendar.DAY_OF_MONTH, 1);
        start.set(Calendar.HOUR_OF_DAY, 0);
        start.set(Calendar.MINUTE, 0);
        start.set(Calendar.SECOND, 0);
        start.set(Calendar.MILLISECOND, 0);
        long startMs = start.getTimeInMillis();

        Calendar end = (Calendar) start.clone();
        end.add(Calendar.MONTH, 1);
        long endMs = end.getTimeInMillis();

        String month = new SimpleDateFormat("MMM yyyy", Locale.getDefault()).format(new Date());
        Cursor c = getReadableDatabase().rawQuery(
                "SELECT COALESCE(SUM(amount),0) FROM tx " +
                        "WHERE income=0 AND is_transfer=0 AND (" +
                        "(timestamp_ms>=? AND timestamp_ms<?) OR " +
                        "(timestamp_ms=0 AND date LIKE ?))",
                new String[]{String.valueOf(startMs), String.valueOf(endMs), "%" + month + "%"});
        try {
            return c.moveToFirst() ? c.getDouble(0) : 0d;
        } finally {
            c.close();
        }
    }

    public boolean updateTransaction(long id, String title, double amount, boolean income, String category) {
        if (amount <= 0 || Double.isNaN(amount) || Double.isInfinite(amount)) return false;
        ContentValues v = new ContentValues();
        v.put("title", title == null ? "" : title.trim());
        v.put("amount", amount);
        v.put("income", income ? 1 : 0);
        v.put("category", category == null ? "Other" : category);
        v.put("reviewed", 1);
        return getWritableDatabase().update("tx", v, "id=? AND is_transfer=0", new String[]{String.valueOf(id)}) > 0;
    }

    public synchronized boolean addTransfer(double amount, String from, String to) {
        if (amount <= 0 || Double.isNaN(amount) || Double.isInfinite(amount)) return false;
        String source = from == null ? "" : from.trim();
        String destination = to == null ? "" : to.trim();
        if (source.isEmpty() || destination.isEmpty() || source.equalsIgnoreCase(destination)) return false;
        ContentValues v = new ContentValues();
        v.put("title", "Transfer · " + source + " → " + destination);
        v.put("amount", amount);
        v.put("income", 0);
        v.put("category", "Transfer");
        v.put("date", new SimpleDateFormat(DATE_PATTERN, Locale.getDefault()).format(new Date()));
        v.put("source", "Manual transfer");
        v.put("fingerprint", "transfer|" + System.currentTimeMillis() + "|" + java.util.UUID.randomUUID());
        v.put("timestamp_ms", System.currentTimeMillis());
        v.put("reviewed", 1);
        v.put("is_transfer", 1);
        v.put("transfer_from", source);
        v.put("transfer_to", destination);
        return getWritableDatabase().insertOrThrow("tx", null, v) != -1;
    }

    public boolean markReviewed(long id) {
        ContentValues values = new ContentValues();
        values.put("reviewed", 1);
        return getWritableDatabase().update("tx", values, "id=? AND reviewed=0", new String[]{String.valueOf(id)}) > 0;
    }

    public int pendingReviewCount() {
        Cursor c = getReadableDatabase().rawQuery("SELECT COUNT(*) FROM tx WHERE reviewed=0", null);
        try { return c.moveToFirst() ? c.getInt(0) : 0; }
        finally { c.close(); }
    }

    public void deleteTransaction(long id) {
        getWritableDatabase().delete("tx", "id=?", new String[]{String.valueOf(id)});
    }

    /** Write a portable, versioned backup without exposing the database file itself. */
    public synchronized void writeBackup(OutputStream output) throws Exception {
        JSONObject root = new JSONObject();
        root.put("formatVersion", 1);
        root.put("app", "MoneyGrow");
        root.put("exportedAt", System.currentTimeMillis());

        JSONArray rows = new JSONArray();
        Cursor c = getReadableDatabase().rawQuery(
                "SELECT id,title,amount,income,category,date,source,fingerprint,timestamp_ms,reviewed,is_transfer,transfer_from,transfer_to FROM tx ORDER BY id ASC",
                null);
        try {
            while (c.moveToNext()) {
                JSONObject row = new JSONObject();
                row.put("id", c.getLong(0));
                row.put("title", c.isNull(1) ? "" : c.getString(1));
                row.put("amount", c.getDouble(2));
                row.put("income", c.getInt(3));
                row.put("category", c.isNull(4) ? "Other" : c.getString(4));
                row.put("date", c.isNull(5) ? "" : c.getString(5));
                row.put("source", c.isNull(6) ? "Manual" : c.getString(6));
                if (!c.isNull(7)) row.put("fingerprint", c.getString(7));
                row.put("timestampMs", c.getLong(8));
                row.put("reviewed", c.getInt(9));
                row.put("isTransfer", c.getInt(10));
                if (!c.isNull(11)) row.put("transferFrom", c.getString(11));
                if (!c.isNull(12)) row.put("transferTo", c.getString(12));
                rows.put(row);
            }
        } finally {
            c.close();
        }
        root.put("transactions", rows);
        output.write(root.toString(2).getBytes(StandardCharsets.UTF_8));
        output.flush();
    }

    /**
     * Restore a validated backup atomically. Existing transactions are replaced
     * only after the entire file has been read and validated successfully.
     */
    public synchronized int restoreBackup(InputStream input) throws Exception {
        ByteArrayOutputStream buffer = new ByteArrayOutputStream();
        byte[] chunk = new byte[8192];
        int count;
        while ((count = input.read(chunk)) != -1) {
            if (buffer.size() + count > 10 * 1024 * 1024) {
                throw new IllegalArgumentException("Backup is larger than 10 MB.");
            }
            buffer.write(chunk, 0, count);
        }

        JSONObject root = new JSONObject(new String(buffer.toByteArray(), StandardCharsets.UTF_8));
        if (!"MoneyGrow".equals(root.optString("app")) || root.optInt("formatVersion", -1) != 1) {
            throw new IllegalArgumentException("This is not a supported MoneyGrow backup.");
        }
        JSONArray rows = root.optJSONArray("transactions");
        if (rows == null || rows.length() > 100000) {
            throw new IllegalArgumentException("The backup transaction list is invalid.");
        }

        Set<Long> ids = new HashSet<>();
        Set<String> fingerprints = new HashSet<>();
        ContentValues[] values = new ContentValues[rows.length()];
        for (int i = 0; i < rows.length(); i++) {
            JSONObject row = rows.getJSONObject(i);
            long id = row.getLong("id");
            double amount = row.getDouble("amount");
            int income = row.getInt("income");
            long timestamp = row.optLong("timestampMs", 0L);
            String fingerprint = row.optString("fingerprint", null);
            if (id <= 0 || !ids.add(id) || amount <= 0 || Double.isNaN(amount) ||
                    Double.isInfinite(amount) || (income != 0 && income != 1) || timestamp < 0) {
                throw new IllegalArgumentException("A transaction in the backup is invalid.");
            }
            if (fingerprint != null && !fingerprints.add(fingerprint)) {
                throw new IllegalArgumentException("The backup contains duplicate transaction fingerprints.");
            }

            ContentValues v = new ContentValues();
            v.put("id", id);
            v.put("title", row.optString("title", ""));
            v.put("amount", amount);
            v.put("income", income);
            v.put("category", row.optString("category", "Other"));
            v.put("date", row.optString("date", ""));
            v.put("source", row.optString("source", "Manual"));
            if (fingerprint == null || fingerprint.isEmpty()) v.putNull("fingerprint");
            else v.put("fingerprint", fingerprint);
            v.put("timestamp_ms", timestamp);
            int reviewed = row.optInt("reviewed", 1);
            if (reviewed != 0 && reviewed != 1) throw new IllegalArgumentException("A transaction review status is invalid.");
            v.put("reviewed", reviewed);
            int isTransfer = row.optInt("isTransfer", 0);
            if (isTransfer != 0 && isTransfer != 1) throw new IllegalArgumentException("A transfer flag is invalid.");
            String transferFrom = row.optString("transferFrom", "");
            String transferTo = row.optString("transferTo", "");
            if (isTransfer == 1 && (transferFrom.trim().isEmpty() || transferTo.trim().isEmpty() || transferFrom.equalsIgnoreCase(transferTo) || income != 0)) {
                throw new IllegalArgumentException("A transfer in the backup is invalid.");
            }
            v.put("is_transfer", isTransfer);
            if (isTransfer == 1) { v.put("transfer_from", transferFrom); v.put("transfer_to", transferTo); }
            values[i] = v;
        }

        SQLiteDatabase database = getWritableDatabase();
        database.beginTransaction();
        try {
            database.delete("tx", null, null);
            for (ContentValues value : values) {
                long inserted = database.insertOrThrow("tx", null, value);
                if (inserted < 0) throw new IllegalStateException("Could not restore a transaction.");
            }
            database.setTransactionSuccessful();
        } finally {
            database.endTransaction();
        }
        return values.length;
    }

    public void deleteAllTransactions() {
        getWritableDatabase().delete("tx", null, null);
    }
}
