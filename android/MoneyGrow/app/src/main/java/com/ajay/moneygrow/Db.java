package com.ajay.moneygrow;
import android.content.*; import android.database.*; import android.database.sqlite.*; import java.text.SimpleDateFormat; import java.util.*;
public class Db extends SQLiteOpenHelper {
 public Db(Context c){super(c,"moneygrow.db",null,1);}
 public void onCreate(SQLiteDatabase d){d.execSQL("CREATE TABLE tx(id INTEGER PRIMARY KEY AUTOINCREMENT,title TEXT,amount REAL,income INTEGER,category TEXT,date TEXT,source TEXT,fingerprint TEXT UNIQUE)");}
 public void onUpgrade(SQLiteDatabase d,int o,int n){}
 public synchronized boolean add(String title,double amount,boolean income,String category,String source,String fingerprint){
  if(amount<=0||Double.isNaN(amount)||Double.isInfinite(amount))return false;
  ContentValues v=new ContentValues();v.put("title",title);v.put("amount",amount);v.put("income",income?1:0);v.put("category",category);
  v.put("date",new SimpleDateFormat("dd MMM yyyy, HH:mm",Locale.getDefault()).format(new Date()));v.put("source",source);v.put("fingerprint",fingerprint);
  return getWritableDatabase().insertWithOnConflict("tx",null,v,SQLiteDatabase.CONFLICT_IGNORE)!=-1;
 }
 public Cursor all(){return getReadableDatabase().rawQuery("SELECT id,title,amount,income,category,date,source FROM tx ORDER BY id DESC",null);}
 public double total(boolean income){Cursor c=getReadableDatabase().rawQuery("SELECT COALESCE(SUM(amount),0) FROM tx WHERE income=?",new String[]{income?"1":"0"});double n=0;if(c.moveToFirst())n=c.getDouble(0);c.close();return n;}
 public void deleteAllTransactions(){getWritableDatabase().delete("tx",null,null);}
}
