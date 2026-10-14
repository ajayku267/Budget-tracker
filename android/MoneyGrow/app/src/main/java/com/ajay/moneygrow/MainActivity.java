package com.ajay.moneygrow;

import android.app.*;
import android.os.Bundle;
import android.content.*;
import android.database.Cursor;
import android.graphics.Color;
import android.graphics.Typeface;
import android.graphics.drawable.GradientDrawable;
import android.view.*;
import android.view.inputmethod.InputMethodManager;
import android.widget.*;
import android.text.InputType;
import android.text.Editable;
import android.text.TextWatcher;
import java.text.NumberFormat;
import java.util.Locale;

public class MainActivity extends Activity {
    private Db db;
    private LinearLayout page, content, nav;
    private TextView balance, incomeValue, expenseValue;
    private int activeTab = 0;
    private boolean dark = false;
    private String searchQuery = "";
    private EditText searchBox;
    private final int green = Color.rgb(30, 126, 84);
    private final NumberFormat money = NumberFormat.getCurrencyInstance(new Locale("en", "IN"));
    private int bg, surface, ink, muted, line, softGreen, softRed;

    private int dp(float v) { return (int)(v * getResources().getDisplayMetrics().density + 0.5f); }
    private void colors() {
        bg = dark ? Color.rgb(15, 21, 18) : Color.rgb(246, 248, 246);
        surface = dark ? Color.rgb(27, 35, 30) : Color.WHITE;
        ink = dark ? Color.rgb(241, 246, 242) : Color.rgb(25, 35, 29);
        muted = dark ? Color.rgb(161, 174, 165) : Color.rgb(119, 132, 123);
        line = dark ? Color.rgb(49, 61, 53) : Color.rgb(231, 236, 232);
        softGreen = dark ? Color.rgb(32, 67, 49) : Color.rgb(229, 244, 234);
        softRed = dark ? Color.rgb(74, 43, 43) : Color.rgb(252, 235, 233);
    }

    @Override public void onCreate(Bundle saved) {
        super.onCreate(saved);
        db = new Db(this);
        dark = getPreferences(MODE_PRIVATE).getBoolean("dark_mode", false);
        render();
    }

    private GradientDrawable shape(int color, int radius) {
        GradientDrawable d = new GradientDrawable();
        d.setColor(color);
        d.setCornerRadius(dp(radius));
        return d;
    }
    private GradientDrawable strokeShape(int color, int radius, int strokeColor) {
        GradientDrawable d = shape(color, radius);
        d.setStroke(dp(1), strokeColor);
        return d;
    }
    private TextView label(String value, int size, int color) {
        TextView t = new TextView(this);
        t.setText(value); t.setTextSize(size); t.setTextColor(color);
        t.setFontFeatureSettings("kern");
        return t;
    }
    private TextView bold(String value, int size, int color) {
        TextView t = label(value, size, color);
        t.setTypeface(Typeface.create("sans-serif-medium", Typeface.NORMAL));
        return t;
    }
    private LinearLayout column() {
        LinearLayout l = new LinearLayout(this); l.setOrientation(LinearLayout.VERTICAL); return l;
    }
    private LinearLayout row() {
        LinearLayout l = new LinearLayout(this); l.setOrientation(LinearLayout.HORIZONTAL); l.setGravity(Gravity.CENTER_VERTICAL); return l;
    }
    private void pad(View v, int l, int t, int r, int b) { v.setPadding(dp(l),dp(t),dp(r),dp(b)); }
    private LinearLayout.LayoutParams lp(int w, int h) { return new LinearLayout.LayoutParams(w < 0 ? w : dp(w), h < 0 ? h : dp(h)); }
    private void gap(LinearLayout parent, int height) { View v = new View(this); parent.addView(v, lp(1,height)); }
    private void divider(LinearLayout parent) { View v = new View(this); v.setBackgroundColor(line); parent.addView(v, lp(-1,1)); }
    private LinearLayout card() {
        LinearLayout c = column(); c.setBackground(strokeShape(surface,22,line)); pad(c,16,16,16,16); return c;
    }
    private void sectionHeader(LinearLayout parent, String title, String action, Runnable onAction) {
        LinearLayout r = row();
        TextView t = bold(title,18,ink); r.addView(t,new LinearLayout.LayoutParams(0,-2,1));
        if (action != null) {
            TextView a = bold(action,13,green); a.setGravity(Gravity.CENTER_VERTICAL);
            a.setOnClickListener(v -> onAction.run()); r.addView(a);
        }
        parent.addView(r); gap(parent,12);
    }
    private TextView pill(String text, int color, int textColor) {
        TextView t = bold(text,12,textColor); t.setGravity(Gravity.CENTER);
        pad(t,10,6,10,6); t.setBackground(shape(color,30)); return t;
    }
    private void render() {
        colors();
        getWindow().setStatusBarColor(bg);
        getWindow().setNavigationBarColor(bg);
        getWindow().getDecorView().setSystemUiVisibility(dark ? 0 : View.SYSTEM_UI_FLAG_LIGHT_STATUS_BAR | View.SYSTEM_UI_FLAG_LIGHT_NAVIGATION_BAR);
        page = column(); page.setBackgroundColor(bg);
        setContentView(page);

        ScrollView scroll = new ScrollView(this);
        scroll.setFillViewport(false);
        scroll.setClipToPadding(false);
        content = column(); pad(content,20,16,20,22);
        scroll.addView(content);
        page.addView(scroll,new LinearLayout.LayoutParams(-1,0,1));

        nav = row(); nav.setBackgroundColor(surface);
        nav.setElevation(dp(12)); pad(nav,8,8,8,8);
        page.addView(nav,lp(-1,68));

        if (activeTab == 0) buildHome();
        else if (activeTab == 1) buildActivity();
        else buildSettings();
        buildNav();
    }

    private void buildTop(String eyebrow, String title, String subtitle) {
        LinearLayout top = row();
        LinearLayout texts = column();
        TextView e = bold(eyebrow.toUpperCase(Locale.ROOT),10,green);
        e.setLetterSpacing(0.13f);
        texts.addView(e); gap(texts,5);
        texts.addView(bold(title,28,ink));
        if (subtitle != null) { gap(texts,4); texts.addView(label(subtitle,13,muted)); }
        top.addView(texts,new LinearLayout.LayoutParams(0,-2,1));
        LinearLayout avatar = new LinearLayout(this); avatar.setGravity(Gravity.CENTER);
        avatar.setBackground(shape(softGreen,18)); avatar.addView(bold("MG",14,green));
        top.addView(avatar,lp(46,46));
        content.addView(top); gap(content,22);
    }

    private void buildHome() {
        buildTop("Your personal finance","Good to see you","A clearer picture of your money.");
        LinearLayout hero = column();
        GradientDrawable gradient = new GradientDrawable(GradientDrawable.Orientation.TL_BR,
                new int[]{Color.rgb(25,112,73),Color.rgb(19,82,57)});
        gradient.setCornerRadius(dp(26)); hero.setBackground(gradient);
        pad(hero,20,20,20,20);
        LinearLayout hr = row();
        TextView title = label("TOTAL NET FLOW",11,Color.rgb(207,235,217)); title.setLetterSpacing(.12f);
        hr.addView(title,new LinearLayout.LayoutParams(0,-2,1));
        TextView dot = label("●  LOCAL",10,Color.rgb(207,235,217)); hr.addView(dot);
        hero.addView(hr); gap(hero,14);
        balance = bold("₹0",34,Color.WHITE); hero.addView(balance);
        gap(hero,6);
        hero.addView(label("Income minus expenses · all time",12,Color.rgb(207,235,217)));
        gap(hero,20);
        View separator = new View(this); separator.setBackgroundColor(0x44ffffff); hero.addView(separator,lp(-1,1));
        gap(hero,14);
        LinearLayout mini = row();
        LinearLayout in = column(), out = column();
        in.addView(label("↗  TOTAL INCOME",10,Color.rgb(207,235,217)));
        incomeValue = bold("₹0",17,Color.WHITE); in.addView(incomeValue);
        out.addView(label("↘  TOTAL EXPENSES",10,Color.rgb(207,235,217)));
        expenseValue = bold("₹0",17,Color.WHITE); out.addView(expenseValue);
        mini.addView(in,new LinearLayout.LayoutParams(0,-2,1));
        mini.addView(out,new LinearLayout.LayoutParams(0,-2,1));
        hero.addView(mini); content.addView(hero); gap(content,18);

        LinearLayout actions = row();
        LinearLayout add = column(); add.setGravity(Gravity.CENTER); pad(add,8,13,8,13);
        add.setBackground(shape(green,18));
        TextView plus = bold("+  Add transaction",15,Color.WHITE); add.addView(plus);
        add.setOnClickListener(v -> addDialog());
        actions.addView(add,new LinearLayout.LayoutParams(0,dp(50),1));
        View spacer = new View(this); actions.addView(spacer,lp(10,1));
        LinearLayout auto = column(); auto.setGravity(Gravity.CENTER); pad(auto,8,13,8,13);
        auto.setBackground(strokeShape(surface,18,line));
        TextView autoT = bold("↗  Auto-detect",14,ink); auto.addView(autoT);
        auto.setOnClickListener(v -> notificationDialog());
        actions.addView(auto,new LinearLayout.LayoutParams(0,dp(50),1));
        content.addView(actions); gap(content,26);

        sectionHeader(content,"Recent activity","See all",() -> {activeTab=1;render();});
        addTransactionRows(content,5,"");
        gap(content,20);
        LinearLayout privacy = row(); privacy.setBackground(shape(softGreen,16)); pad(privacy,14,12,14,12);
        TextView shield = label("✓",17,green); privacy.addView(shield); View sp=new View(this);privacy.addView(sp,lp(10,1));
        LinearLayout privacyText = column();
        privacyText.addView(bold("Your data stays yours",13,ink));
        gap(privacyText,3); privacyText.addView(label("Saved on this phone. Nothing is uploaded.",11,muted));
        privacy.addView(privacyText); content.addView(privacy);
        refreshTotals();
    }

    private void buildActivity() {
        buildTop("Your money timeline","Activity","Every transaction, all in one place.");
        searchBox = new EditText(this);
        searchBox.setSingleLine(true); searchBox.setTextSize(14); searchBox.setTextColor(ink);
        searchBox.setHintTextColor(muted); searchBox.setHint("⌕   Search transactions");
        searchBox.setBackground(strokeShape(surface,16,line)); pad(searchBox,14,4,14,4);
        searchBox.setText(searchQuery); content.addView(searchBox,lp(-1,48)); gap(content,20);
        sectionHeader(content,"All transactions",null,null);
        addTransactionRows(content,Integer.MAX_VALUE,searchQuery);
        searchBox.addTextChangedListener(new TextWatcher() {
            public void beforeTextChanged(CharSequence s,int st,int count,int after){}
            public void onTextChanged(CharSequence s,int st,int before,int count){searchQuery=s.toString(); rebuildActivityRows();}
            public void afterTextChanged(Editable e){}
        });
    }
    private void rebuildActivityRows() {
        if (activeTab != 1) return;
        render();
        if (searchBox != null) { searchBox.requestFocus(); searchBox.setSelection(searchBox.length()); }
    }

    private void addTransactionRows(LinearLayout parent, int limit, String query) {
        LinearLayout wrap = card();
        Cursor c = db.all(); int count=0;
        try {
            while(c.moveToNext() && count<limit) {
                String title=c.getString(1), category=c.getString(4), date=c.getString(5);
                double amount=c.getDouble(2); boolean isIncome=c.getInt(3)==1;
                if (query != null && !query.trim().isEmpty()) {
                    String q=query.toLowerCase(Locale.ROOT);
                    if (!(title.toLowerCase(Locale.ROOT).contains(q) || category.toLowerCase(Locale.ROOT).contains(q) || date.toLowerCase(Locale.ROOT).contains(q))) continue;
                }
                if(count>0) gap(wrap,2);
                LinearLayout item=row(); pad(item,0,10,0,10);
                TextView icon = bold(categoryIcon(category),17,isIncome?green:Color.rgb(196,83,77));
                icon.setGravity(Gravity.CENTER); icon.setBackground(shape(isIncome?softGreen:softRed,15));
                item.addView(icon,lp(44,44));
                View space=new View(this);item.addView(space,lp(12,1));
                LinearLayout detail=column();
                detail.addView(bold(title,14,ink)); gap(detail,4);
                detail.addView(label(category+"  ·  "+date,11,muted));
                item.addView(detail,new LinearLayout.LayoutParams(0,-2,1));
                LinearLayout amt=column(); amt.setGravity(Gravity.RIGHT|Gravity.CENTER_VERTICAL);
                amt.addView(bold((isIncome?"+":"−")+money.format(amount),13,isIncome?green:ink));
                gap(amt,4); amt.addView(label(isIncome?"Income":"Expense",10,muted));
                item.addView(amt);
                wrap.addView(item); count++;
            }
        } finally { c.close(); }
        if(count==0) {
            LinearLayout empty=column();empty.setGravity(Gravity.CENTER);pad(empty,10,26,10,26);
            TextView icon=label("◌",30,muted);icon.setGravity(Gravity.CENTER);empty.addView(icon);gap(empty,8);
            TextView title=bold(query==null||query.isEmpty()?"Your story starts here":"No matches found",15,ink);title.setGravity(Gravity.CENTER);empty.addView(title);gap(empty,5);
            TextView sub=label(query==null||query.isEmpty()?"Add your first transaction to see it here.":"Try another name or category.",12,muted);sub.setGravity(Gravity.CENTER);empty.addView(sub);
            wrap.addView(empty);
        }
        parent.addView(wrap);
    }

    private String categoryIcon(String category) {
        String c=category.toLowerCase(Locale.ROOT);
        if(c.contains("food")||c.contains("grocer"))return "✳";
        if(c.contains("salary")||c.contains("income"))return "↗";
        if(c.contains("transport")||c.contains("fuel"))return "↗";
        if(c.contains("bill"))return "⌁";
        if(c.contains("shop"))return "◇";
        return "₹";
    }

    private void buildSettings() {
        buildTop("Make it yours","Settings","Simple controls. Private by design.");
        LinearLayout appearance=card();
        appearance.addView(bold("Appearance",16,ink));gap(6);
        appearance.addView(label("Choose the look that feels right.",12,muted));gap(14);
        LinearLayout mode=row();
        LinearLayout light=column();light.setGravity(Gravity.CENTER);pad(light,8,12,8,12);
        light.setBackground(strokeShape(!dark?softGreen:surface,14,!dark?green:line));
        light.addView(bold("☀  Light",13,ink)); light.setOnClickListener(v->setDark(false));
        LinearLayout night=column();night.setGravity(Gravity.CENTER);pad(night,8,12,8,12);
        night.setBackground(strokeShape(dark?softGreen:surface,14,dark?green:line));
        night.addView(bold("☾  Dark",13,ink)); night.setOnClickListener(v->setDark(true));
        mode.addView(light,new LinearLayout.LayoutParams(0,-2,1));View gap=new View(this);mode.addView(gap,lp(10,1));mode.addView(night,new LinearLayout.LayoutParams(0,-2,1));appearance.addView(mode);
        content.addView(appearance);gap(content,14);

        LinearLayout privacy=card();privacy.addView(bold("Privacy & permissions",16,ink));gap(5);
        privacy.addView(label("MoneyGrow stores transactions in a local database on this phone. It has no account, cloud sync, analytics or internet permission.",12,muted));gap(14);
        addSettingAction(privacy,"Notification access","Optional payment alert detection","Manage",()->notificationDialog());
        divider(privacy);
        addSettingAction(privacy,"Delete transaction history","Permanently remove all saved entries","Delete",()->deleteDialog());
        content.addView(privacy);gap(content,14);

        LinearLayout about=card();about.addView(bold("About MoneyGrow",16,ink));gap(7);
        about.addView(label("Version 1.0 · Local-first finance tracker",12,muted));gap(12);
        about.addView(label("Automatic detection is best-effort. Always review imported transactions for accuracy.",12,muted));
        content.addView(about);gap(content,18);
        TextView footer=label("MADE FOR YOUR FINANCIAL CLARITY",10,muted);footer.setGravity(Gravity.CENTER);footer.setLetterSpacing(.12f);content.addView(footer);
    }

    private void addSettingAction(LinearLayout parent,String title,String sub,String action,Runnable click) {
        LinearLayout r=row();pad(r,0,12,0,12);LinearLayout texts=column();
        texts.addView(bold(title,14,ink));gap(texts,4);texts.addView(label(sub,11,muted));
        r.addView(texts,new LinearLayout.LayoutParams(0,-2,1));
        TextView btn=pill(action,softGreen,green);r.addView(btn);r.setOnClickListener(v->click.run());parent.addView(r);
    }

    private void buildNav() {
        nav.removeAllViews();
        String[] names={"Home","Activity","Settings"};
        String[] icons={"⌂","↕","⚙"};
        for(int i=0;i<names.length;i++) {
            final int index=i;
            LinearLayout item=column();item.setGravity(Gravity.CENTER);pad(item,4,5,4,3);
            int color=activeTab==i?green:muted;
            TextView ic=bold(icons[i],21,color);ic.setGravity(Gravity.CENTER);item.addView(ic);gap(item,2);
            TextView tx=bold(names[i],10,color);item.addView(tx);
            item.setOnClickListener(v->{activeTab=index;render();});
            nav.addView(item,new LinearLayout.LayoutParams(0,-1,1));
        }
    }

    private void refreshTotals() {
        double inc=db.total(true), out=db.total(false);
        if(balance!=null)balance.setText(money.format(inc-out));
        if(incomeValue!=null)incomeValue.setText(money.format(inc));
        if(expenseValue!=null)expenseValue.setText(money.format(out));
    }

    private void setDark(boolean value) {
        dark=value;getPreferences(MODE_PRIVATE).edit().putBoolean("dark_mode",dark).apply();render();
    }

    private void notificationDialog() {
        new AlertDialog.Builder(this)
            .setTitle("Automatic transaction detection")
            .setMessage("Notification access is a powerful Android permission. While enabled, Android can deliver notifications from across your device. MoneyGrow filters likely payment alerts and stores a generic label, amount, direction, category, date and app package only. Raw notification text and payee names are not saved, and nothing is uploaded. Detection can miss or misread alerts.")
            .setNegativeButton("Not now",null)
            .setPositiveButton("Open settings",(d,w)->startActivity(new Intent("android.settings.ACTION_NOTIFICATION_LISTENER_SETTINGS")))
            .show();
    }

    private void deleteDialog() {
        new AlertDialog.Builder(this).setTitle("Delete all transactions?")
            .setMessage("This permanently deletes all MoneyGrow transaction records stored on this phone.")
            .setNegativeButton("Cancel",null)
            .setPositiveButton("Delete all",(d,w)->{db.deleteAllTransactions();render();})
            .show();
    }

    private void addDialog() {
        LinearLayout form=column();pad(form,4,4,4,0);
        EditText title=new EditText(this);title.setSingleLine(true);title.setHint("What was it for?");form.addView(title);
        EditText amount=new EditText(this);amount.setSingleLine(true);amount.setHint("Amount in ₹");amount.setInputType(InputType.TYPE_CLASS_NUMBER|InputType.TYPE_NUMBER_FLAG_DECIMAL);form.addView(amount);
        EditText category=new EditText(this);category.setSingleLine(true);category.setHint("Category · e.g. Food, Salary");form.addView(category);
        final boolean[] isIncome={false};
        Switch sw=new Switch(this);sw.setText("Money coming in");sw.setTextColor(ink);sw.setPadding(0,dp(10),0,dp(10));sw.setOnCheckedChangeListener((v,on)->isIncome[0]=on);form.addView(sw);
        AlertDialog dialog=new AlertDialog.Builder(this).setTitle("New transaction").setView(form)
            .setNegativeButton("Cancel",null).setPositiveButton("Save",null).create();
        dialog.setOnShowListener(x->dialog.getButton(AlertDialog.BUTTON_POSITIVE).setOnClickListener(v->{
            String raw=amount.getText().toString().trim();
            double value;
            try{value=Double.parseDouble(raw);}catch(Exception e){amount.setError("Enter a valid amount");return;}
            if(value<=0||Double.isInfinite(value)||Double.isNaN(value)){amount.setError("Amount must be greater than zero");return;}
            String name=title.getText().toString().trim();if(name.isEmpty())name="Transaction";
            String cat=category.getText().toString().trim();if(cat.isEmpty())cat="Uncategorised";
            db.add(name,value,isIncome[0],cat,"Manual","manual|"+System.currentTimeMillis());
            ((InputMethodManager)getSystemService(INPUT_METHOD_SERVICE)).hideSoftInputFromWindow(amount.getWindowToken(),0);
            dialog.dismiss();searchQuery="";render();
        }));
        dialog.show();
    }
}
