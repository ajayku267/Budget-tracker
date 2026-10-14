package com.ajay.moneygrow;

import android.app.Notification;
import android.os.Bundle;
import android.service.notification.NotificationListenerService;
import android.service.notification.StatusBarNotification;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.Locale;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class TransactionNotificationListener extends NotificationListenerService {
    private static final Pattern AMOUNT = Pattern.compile(
        "(?i)(?:₹\\s*|rs\\.?\\s*|inr\\s*)([0-9][0-9,]*(?:\\.[0-9]{1,2})?)"
    );

    @Override public void onNotificationPosted(StatusBarNotification sbn) {
        try {
            String pkg = sbn.getPackageName() == null ? "" : sbn.getPackageName().toLowerCase(Locale.ROOT);
            if (!isSupportedPaymentApp(pkg)) return;

            Notification n = sbn.getNotification();
            if (n == null || n.extras == null) return;
            Bundle extras = n.extras;
            String title = text(extras.getCharSequence(Notification.EXTRA_TITLE));
            String body = text(extras.getCharSequence(Notification.EXTRA_BIG_TEXT));
            if (body.isEmpty()) body = text(extras.getCharSequence(Notification.EXTRA_TEXT));
            if (body.isEmpty()) {
                CharSequence[] lines = extras.getCharSequenceArray(Notification.EXTRA_TEXT_LINES);
                if (lines != null) {
                    StringBuilder b = new StringBuilder();
                    for (CharSequence line : lines) if (line != null) b.append(line).append(' ');
                    body = b.toString();
                }
            }

            String all = (title + " " + body).trim();
            String normalized = all.toLowerCase(Locale.ROOT);
            if (all.isEmpty() || isNotATransaction(normalized)) return;

            boolean incoming = isIncoming(normalized);
            boolean outgoing = isOutgoing(normalized);
            // Ambiguous alerts (e.g. "payment initiated") are not imported.
            if (incoming == outgoing) return;

            Matcher matcher = AMOUNT.matcher(all);
            if (!matcher.find()) return;
            double amount = Double.parseDouble(matcher.group(1).replace(",", ""));
            if (amount <= 0 || Double.isInfinite(amount) || Double.isNaN(amount)) return;

            String category = category(normalized, incoming);
            String label = incoming ? "UPI received" : "UPI payment";
            // Keep notification text and payee names out of the database.
            // Hash a stable notification identity + transaction facts to avoid re-importing updates.
            String identity = pkg + "|" + sbn.getKey() + "|" + amount + "|" +
                (incoming ? "in" : "out") + "|" + category + "|" + (n.when > 0 ? n.when : sbn.getPostTime());
            String fingerprint = sha256(identity);
            new Db(getApplicationContext()).add(label, amount, incoming, category, pkg, fingerprint);
        } catch (Exception ignored) {
            // Notifications are untrusted input; one malformed alert must not crash the listener.
        }
    }

    private boolean isSupportedPaymentApp(String pkg) {
        return pkg.contains("phonepe")
            || pkg.contains("paytm")
            || pkg.contains("google.android.apps.nbu")
            || pkg.contains("gpay")
            || pkg.contains("bhim")
            || pkg.contains("mobikwik")
            || pkg.contains("amazon.mshop")
            || pkg.contains("freecharge")
            || pkg.contains("cred")
            || pkg.contains("whatsapp")
            || pkg.contains("upi")
            || pkg.contains("imobile")
            || pkg.contains("bobworld")
            || pkg.contains("yono")
            || pkg.contains("pnb")
            || pkg.contains("axis")
            || pkg.contains("hdfc")
            || pkg.contains("icici")
            || pkg.contains("sbi")
            || pkg.contains("kotak")
            || pkg.contains("indus")
            || pkg.contains("canara")
            || pkg.contains("unionbank")
            || pkg.contains("federal");
    }

    private boolean isNotATransaction(String s) {
        return containsAny(s, "request money", "collect request", "pending request",
            "approve payment", "enter upi pin", "set upi pin", "link bank account",
            "transaction limit", "offers for you", "cashback offer", "reminder to pay");
    }

    private boolean isIncoming(String s) {
        return containsAny(s, "received ₹", "received rs", "received inr", "you received",
            "money received", "payment received", "amount credited", "credited to",
            "credited in", "upi credit", "refund successful", "refund received",
            "cashback received", "has sent you", "sent you ₹", "paid you");
    }

    private boolean isOutgoing(String s) {
        return containsAny(s, "you paid", "paid ₹", "paid rs", "paid inr",
            "payment successful", "payment of ₹", "payment of rs", "sent ₹",
            "sent rs", "sent inr", "money sent", "amount debited", "debited from",
            "debited by", "upi debit", "paid to", "purchase successful",
            "successfully paid", "transaction successful");
    }

    private boolean containsAny(String s, String... terms) {
        for (String term : terms) if (s.contains(term)) return true;
        return false;
    }

    private String category(String s, boolean incoming) {
        if (incoming && containsAny(s, "salary", "payroll", "stipend")) return "Salary";
        if (incoming && containsAny(s, "refund", "cashback")) return "Refund";
        if (containsAny(s, "grocery", "groceries", "supermarket", "vegetable")) return "Groceries";
        if (containsAny(s, "swiggy", "zomato", "restaurant", "food", "cafe")) return "Food";
        if (containsAny(s, "electricity", "water bill", "recharge", "bill payment", "broadband")) return "Bills";
        if (containsAny(s, "fuel", "petrol", "diesel", "metro", "cab", "uber", "ola")) return "Transport";
        if (containsAny(s, "shopping", "store", "mall", "amazon", "flipkart")) return "Shopping";
        if (incoming) return "Income · review";
        return "UPI · review";
    }

    private String text(CharSequence value) {
        return value == null ? "" : value.toString();
    }

    private String sha256(String value) throws Exception {
        byte[] bytes = MessageDigest.getInstance("SHA-256").digest(value.getBytes(StandardCharsets.UTF_8));
        StringBuilder out = new StringBuilder();
        for (byte b : bytes) out.append(String.format(Locale.ROOT, "%02x", b & 0xff));
        return out.toString();
    }
}
