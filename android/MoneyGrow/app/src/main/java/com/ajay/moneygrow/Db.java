package com.ajay.moneygrow;

import android.content.ContentValues;
import android.content.Context;
import android.database.Cursor;
import android.database.sqlite.SQLiteDatabase;
import android.database.sqlite.SQLiteOpenHelper;

import java.text.ParsePosition;
import java.text.SimpleDateFormat;
import java.util.Calendar;
import java.util.Date;
import java.util.Locale;
import java.util.TimeZone;

public class Db extends SQLiteOpenHelper {
    private static final int DATABASE_VERSION = 2;
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
                "timestamp_ms INTEGER NOT NULL DEFAULT 0)");
    }

    @Override
    public void onUpgrade(SQLiteDatabase d, int oldVersion, int newVersion) {
        if (oldVersion < 2) {
            d.execSQL("ALTER TABLE tx ADD COLUMN timestamp_ms INTEGER NOT NULL DEFAULT 0");
            backfillLegacyTimestamps(d);
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
        return getWritableDatabase().insertWithOnConflict(
                "tx", null, v, SQLiteDatabase.CONFLICT_IGNORE) != -1;
    }

    public Cursor all() {
        return getReadableDatabase().rawQuery(
                "SELECT id,title,amount,income,category,date,source FROM tx ORDER BY id DESC", null);
    }

    public double total(boolean income) {
        Cursor c = getReadableDatabase().rawQuery(
                "SELECT COALESCE(SUM(amount),0) FROM tx WHERE income=?",
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
                        "WHERE income=0 AND (" +
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
        return getWritableDatabase().update("tx", v, "id=?", new String[]{String.valueOf(id)}) > 0;
    }

    public void deleteTransaction(long id) {
        getWritableDatabase().delete("tx", "id=?", new String[]{String.valueOf(id)});
    }

    public void deleteAllTransactions() {
        getWritableDatabase().delete("tx", null, null);
    }
}
