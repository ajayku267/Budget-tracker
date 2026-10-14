package com.ajay.moneygrow;
import android.app.Notification; import android.os.Bundle; import android.service.notification.*; import java.util.Locale; import java.util.regex.*;
public class TransactionNotificationListener extends NotificationListenerService {
 private static final Pattern AMOUNT=Pattern.compile("(?i)(?:₹\\s*|rs\\.?\\s*|inr\\s*)([0-9,]+(?:\\.[0-9]{1,2})?)");
 @Override public void onNotificationPosted(StatusBarNotification sbn){
  try{
   String pkg=sbn.getPackageName().toLowerCase(Locale.ROOT);
   if(!(pkg.contains("phonepe")||pkg.contains("paytm")||pkg.contains("google.android.apps.nbu")||pkg.contains("gpay")||pkg.contains("bhim")||pkg.contains("upi")||pkg.contains("bank")||pkg.contains("imobile")||pkg.contains("bobworld")||pkg.contains("yono")||pkg.contains("mobikwik")||pkg.contains("amazon.mshop")))return;
   Bundle e=sbn.getNotification().extras;CharSequence t=e.getCharSequence(Notification.EXTRA_TITLE),b=e.getCharSequence(Notification.EXTRA_BIG_TEXT),x=e.getCharSequence(Notification.EXTRA_TEXT);
   String title=t==null?"":t.toString(),body=b!=null?b.toString():(x==null?"":x.toString()),s=(title+" "+body).toLowerCase(Locale.ROOT);
   boolean in=has(s,"received","credited","refund","cashback received"),out=has(s,"paid","debited","sent","spent","payment successful","you paid","purchase");
   if(!in&&!out)return;
   Matcher m=AMOUNT.matcher(title+" "+body);if(!m.find())return;double amount=Double.parseDouble(m.group(1).replace(",",""));if(amount<=0||Double.isNaN(amount)||Double.isInfinite(amount))return;
   String cat=category(s),safe=in?"Detected incoming payment":"Detected outgoing payment";
   String fp=pkg+"|"+sbn.getPostTime()+"|"+amount+"|"+(in?"in":"out");
   new Db(this).add(safe,amount,in,cat,pkg,fp);
  }catch(Exception ignored){}
 }
 private boolean has(String s,String...terms){for(String t:terms)if(s.contains(t))return true;return false;}
 private String category(String s){if(has(s,"salary","payroll","stipend"))return "Salary";if(has(s,"grocery","groceries","supermarket"))return "Groceries";if(has(s,"food","restaurant","swiggy","zomato"))return "Food";if(has(s,"electricity","water bill","recharge","bill payment"))return "Bills";if(has(s,"fuel","petrol","diesel"))return "Transport";return "Needs review";}
}
