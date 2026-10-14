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
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.io.OutputStream;

public class MainActivity extends Activity {
    private static final int REQUEST_CREATE_BACKUP = 7101;
    private static final int REQUEST_RESTORE_BACKUP = 7102;
    private Db db;
    private LinearLayout page, content, nav;
    private TextView balance, incomeValue, expenseValue;
    private int activeTab = 0;
    private int activityFilter = 0;
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
        else if (activeTab == 2) buildInsights();
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

        buildBudgetCard(); gap(content,22);
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


    private void buildBudgetCard() {
        LinearLayout budget=card();
        LinearLayout header=row(), labels=column();
        labels.addView(bold("Monthly spending plan",16,ink));
        gap(labels,4); labels.addView(label("Keep this month's expenses in check.",12,muted));
        header.addView(labels,new LinearLayout.LayoutParams(0,-2,1));
        TextView edit=pill("Set budget",softGreen,green);
        edit.setOnClickListener(v->budgetDialog()); header.addView(edit);
        budget.addView(header); gap(budget,16);
        double limit=getPreferences(MODE_PRIVATE).getFloat("monthly_budget",0f);
        double spent=db.currentMonthExpenses();
        LinearLayout amounts=row(), spentCol=column(), limitCol=column();
        spentCol.addView(label("SPENT THIS MONTH",10,muted));
        spentCol.addView(bold(money.format(spent),18,ink));
        limitCol.setGravity(Gravity.RIGHT);
        limitCol.addView(label("MONTHLY LIMIT",10,muted));
        limitCol.addView(bold(limit>0?money.format(limit):"Not set",16,ink));
        amounts.addView(spentCol,new LinearLayout.LayoutParams(0,-2,1)); amounts.addView(limitCol);
        budget.addView(amounts); gap(budget,12);
        if(limit>0) {
            android.widget.FrameLayout frame=new android.widget.FrameLayout(this);
            frame.setBackground(shape(softRed,20));
            int maxWidth=getResources().getDisplayMetrics().widthPixels-dp(80);
            int fillWidth=(int)(Math.max(0,Math.min(1,spent/limit))*maxWidth);
            View fill=new View(this); fill.setBackground(shape(spent>limit?Color.rgb(196,83,77):green,20));
            frame.addView(fill,new android.widget.FrameLayout.LayoutParams(fillWidth,dp(8),Gravity.LEFT));
            budget.addView(frame,lp(-1,8)); gap(budget,8);
            double remaining=limit-spent;
            budget.addView(label(remaining>=0?money.format(remaining)+" left to spend":money.format(-remaining)+" over budget",12,remaining>=0?green:Color.rgb(196,83,77)));
        } else budget.addView(label("Set a monthly limit to see your spending progress.",12,muted));
        content.addView(budget);
    }

    private void budgetDialog() {
        EditText amount=new EditText(this); amount.setSingleLine(true);
        amount.setInputType(InputType.TYPE_CLASS_NUMBER|InputType.TYPE_NUMBER_FLAG_DECIMAL); amount.setHint("Monthly limit in ₹");
        float current=getPreferences(MODE_PRIVATE).getFloat("monthly_budget",0f); if(current>0) amount.setText(String.valueOf(current));
        LinearLayout box=column(); pad(box,4,4,4,0); box.addView(amount);
        AlertDialog dialog=new AlertDialog.Builder(this).setTitle("Set monthly budget").setMessage("Your budget stays on this phone.").setView(box)
            .setNegativeButton("Cancel",null).setNeutralButton("Remove",null).setPositiveButton("Save",null).create();
        dialog.setOnShowListener(v->{
            dialog.getButton(AlertDialog.BUTTON_POSITIVE).setOnClickListener(b->{
                try {
                    double value=Double.parseDouble(amount.getText().toString().trim());
                    if(value<=0||Double.isInfinite(value)||Double.isNaN(value)||value>1000000000){amount.setError("Enter a valid budget");return;}
                    getPreferences(MODE_PRIVATE).edit().putFloat("monthly_budget",(float)value).apply(); dialog.dismiss(); render();
                } catch(Exception e){amount.setError("Enter a valid budget");}
            });
            dialog.getButton(AlertDialog.BUTTON_NEUTRAL).setOnClickListener(b->{getPreferences(MODE_PRIVATE).edit().remove("monthly_budget").apply();dialog.dismiss();render();});
        });
        dialog.show();
    }

    private void exportCsv() {
        Cursor c=db.all(); StringBuilder csv=new StringBuilder("Date,Title,Amount,Type,Category,Source\n");
        try {
            while(c.moveToNext()) {
                String title=c.getString(1), category=c.getString(4), date=c.getString(5), source=c.getString(6);
                boolean transfer=c.getColumnCount()>8 && c.getInt(8)==1;
                csv.append(csvCell(date)).append(',').append(csvCell(title)).append(',')
                    .append(String.format(Locale.US,"%.2f",c.getDouble(2))).append(',')
                    .append(transfer?"Transfer":(c.getInt(3)==1?"Income":"Expense")).append(',')
                    .append(csvCell(category)).append(',').append(csvCell(source)).append('\n');
            }
        } finally { c.close(); }
        Intent share=new Intent(Intent.ACTION_SEND); share.setType("text/csv");
        share.putExtra(Intent.EXTRA_SUBJECT,"MoneyGrow transactions"); share.putExtra(Intent.EXTRA_TEXT,csv.toString());
        startActivity(Intent.createChooser(share,"Export transactions"));
    }

    private String csvCell(String value) {
        if(value==null)return "\"\"";
        return "\"" + value.replace("\"","\"\"") + "\"";
    }

    private void transferDialog() {
        LinearLayout form=column(); pad(form,4,4,4,0);
        EditText amount=new EditText(this); amount.setSingleLine(true);
        amount.setHint("Amount in ₹"); amount.setInputType(InputType.TYPE_CLASS_NUMBER|InputType.TYPE_NUMBER_FLAG_DECIMAL); form.addView(amount);
        EditText from=new EditText(this); from.setSingleLine(true); from.setHint("From account · e.g. Cash"); form.addView(from);
        EditText to=new EditText(this); to.setSingleLine(true); to.setHint("To account · e.g. Savings"); form.addView(to);
        AlertDialog dialog=new AlertDialog.Builder(this).setTitle("Record a transfer")
            .setMessage("Transfers are recorded for your timeline but excluded from income, expenses and budget totals.")
            .setView(form).setNegativeButton("Cancel",null).setPositiveButton("Save transfer",null).create();
        dialog.setOnShowListener(v->dialog.getButton(AlertDialog.BUTTON_POSITIVE).setOnClickListener(b->{
            double value;
            try { value=Double.parseDouble(amount.getText().toString().trim()); }
            catch(Exception e) { amount.setError("Enter a valid amount"); return; }
            if(value<=0||Double.isInfinite(value)||Double.isNaN(value)) { amount.setError("Amount must be greater than zero"); return; }
            String source=from.getText().toString().trim(), destination=to.getText().toString().trim();
            if(source.isEmpty()) { from.setError("Enter the account money leaves"); return; }
            if(destination.isEmpty()) { to.setError("Enter the account money goes to"); return; }
            if(source.equalsIgnoreCase(destination)) { to.setError("Choose a different destination"); return; }
            if(!db.addTransfer(value,source,destination)) { amount.setError("Could not save this transfer"); return; }
            dialog.dismiss(); render();
        }));
        dialog.show();
    }

    private void transferActions(long id,String title) {
        new AlertDialog.Builder(this).setTitle(title)
            .setMessage("This transfer is excluded from income and expense totals.")
            .setNegativeButton("Close",null)
            .setPositiveButton("Delete transfer",(d,w)->{db.deleteTransaction(id);render();})
            .show();
    }

    private void transactionActions(long id,String title,double amount,boolean income,String category,boolean needsReview) {
        String[] actions = needsReview
                ? new String[]{"Mark as reviewed","Edit transaction","Delete transaction"}
                : new String[]{"Edit transaction","Delete transaction"};
        new AlertDialog.Builder(this).setTitle(title).setItems(actions,(dialog,which)->{
            if (needsReview && which == 0) {
                db.markReviewed(id);
                render();
            } else {
                int action = needsReview ? which - 1 : which;
                if(action==0) editTransactionDialog(id,title,amount,income,category);
                else new AlertDialog.Builder(this).setTitle("Delete transaction?").setMessage("This removes only this entry from this phone.")
                    .setNegativeButton("Cancel",null).setPositiveButton("Delete",(d,w)->{db.deleteTransaction(id);render();}).show();
            }
        }).show();
    }

    private void editTransactionDialog(long id,String oldTitle,double oldAmount,boolean oldIncome,String oldCategory) {
        LinearLayout form=column(); pad(form,4,4,4,0);
        EditText title=new EditText(this); title.setSingleLine(true); title.setHint("What was it for?"); title.setText(oldTitle); form.addView(title);
        EditText amount=new EditText(this); amount.setSingleLine(true); amount.setInputType(InputType.TYPE_CLASS_NUMBER|InputType.TYPE_NUMBER_FLAG_DECIMAL); amount.setText(String.valueOf(oldAmount)); form.addView(amount);
        EditText category=new EditText(this); category.setSingleLine(true); category.setHint("Category"); category.setText(oldCategory); form.addView(category);
        Switch sw=new Switch(this); sw.setText("Money coming in"); sw.setTextColor(ink); sw.setChecked(oldIncome); form.addView(sw);
        AlertDialog dialog=new AlertDialog.Builder(this).setTitle("Edit transaction").setView(form).setNegativeButton("Cancel",null).setPositiveButton("Save",null).create();
        dialog.setOnShowListener(v->dialog.getButton(AlertDialog.BUTTON_POSITIVE).setOnClickListener(b->{
            double value;
            try{value=Double.parseDouble(amount.getText().toString().trim());}catch(Exception e){amount.setError("Enter a valid amount");return;}
            if(value<=0||Double.isInfinite(value)||Double.isNaN(value)){amount.setError("Amount must be greater than zero");return;}
            String name=title.getText().toString().trim(); if(name.isEmpty()){title.setError("Add a description");return;}
            String cat=category.getText().toString().trim(); if(cat.isEmpty())cat="Uncategorised";
            db.updateTransaction(id,name,value,sw.isChecked(),cat); dialog.dismiss(); render();
        }));
        dialog.show();
    }

    private void buildActivity() {
        buildTop("Your money timeline","Activity","Every transaction, all in one place.");
        searchBox = new EditText(this);
        searchBox.setSingleLine(true); searchBox.setTextSize(14); searchBox.setTextColor(ink);
        searchBox.setHintTextColor(muted); searchBox.setHint("⌕   Search transactions");
        searchBox.setBackground(strokeShape(surface,16,line)); pad(searchBox,14,4,14,4);
        searchBox.setText(searchQuery); content.addView(searchBox,lp(-1,48)); gap(content,12);
        LinearLayout filters=row();
        String[] filterNames={"All","Expenses","Income"};
        for(int i=0;i<filterNames.length;i++) {
            final int chosen=i;
            TextView chip=pill(filterNames[i],activityFilter==i?softGreen:surface,activityFilter==i?green:muted);
            chip.setBackground(strokeShape(activityFilter==i?softGreen:surface,24,activityFilter==i?green:line));
            chip.setOnClickListener(v->{activityFilter=chosen;render();});
            LinearLayout.LayoutParams cp=new LinearLayout.LayoutParams(0,dp(36),1);
            if(i>0) cp.leftMargin=dp(8);
            filters.addView(chip,cp);
        }
        content.addView(filters);gap(content,18);
        int pendingReviews = db.pendingReviewCount();
        if (pendingReviews > 0) {
            LinearLayout review = row();
            review.setBackground(shape(softGreen,14)); pad(review,12,10,12,10);
            TextView mark = bold("!",16,green); review.addView(mark);
            View reviewSpace = new View(this); review.addView(reviewSpace,lp(8,1));
            LinearLayout reviewText = column();
            reviewText.addView(bold(pendingReviews + " payment alert(s) to review",13,ink));
            gap(reviewText,3);
            reviewText.addView(label("Check imported entries for mistakes.",11,muted));
            review.addView(reviewText); content.addView(review); gap(content,12);
        }
        sectionHeader(content,"All transactions","Export CSV",()->exportCsv());
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
                long transactionId=c.getLong(0);
                String title=c.getString(1), category=c.getString(4), date=c.getString(5);
                double amount=c.getDouble(2); boolean isIncome=c.getInt(3)==1;
                boolean needsReview = c.getColumnCount() > 7 && c.getInt(7) == 0;
                boolean isTransfer = c.getColumnCount() > 8 && c.getInt(8) == 1;
                if(activeTab==1 && activityFilter==1 && isIncome) continue;
                if(activeTab==1 && activityFilter==2 && !isIncome) continue;
                if (query != null && !query.trim().isEmpty()) {
                    String q=query.toLowerCase(Locale.ROOT);
                    if (!(title.toLowerCase(Locale.ROOT).contains(q) || category.toLowerCase(Locale.ROOT).contains(q) || date.toLowerCase(Locale.ROOT).contains(q))) continue;
                }
                if(count>0) gap(wrap,2);
                LinearLayout item=row(); pad(item,0,10,0,10);
                TextView icon = bold(isTransfer?"↔":categoryIcon(category),17,(isIncome||isTransfer)?green:Color.rgb(196,83,77));
                icon.setGravity(Gravity.CENTER); icon.setBackground(shape((isIncome||isTransfer)?softGreen:softRed,15));
                item.addView(icon,lp(44,44));
                View space=new View(this);item.addView(space,lp(12,1));
                LinearLayout detail=column();
                detail.addView(bold(title,14,ink)); gap(detail,4);
                detail.addView(label(category+"  ·  "+date+(needsReview ? "  ·  REVIEW" : ""),11,needsReview?green:muted));
                item.addView(detail,new LinearLayout.LayoutParams(0,-2,1));
                LinearLayout amt=column(); amt.setGravity(Gravity.RIGHT|Gravity.CENTER_VERTICAL);
                amt.addView(bold((isTransfer?"↔ ":isIncome?"+":"−")+money.format(amount),13,(isIncome||isTransfer)?green:ink));
                gap(amt,4); amt.addView(label(isTransfer?"Transfer":(isIncome?"Income":"Expense"),10,muted));
                item.addView(amt);
                item.setOnClickListener(v -> { if (isTransfer) transferActions(transactionId,title); else transactionActions(transactionId,title,amount,isIncome,category,needsReview); });
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

    private void buildInsights() {
        buildTop("Understand your habits","Insights","A clearer view of this month's money.");
        String month = new java.text.SimpleDateFormat("MMM yyyy", Locale.getDefault()).format(new java.util.Date());
        double monthIncome = 0, monthExpense = 0;
        java.util.HashMap<String,Double> categories = new java.util.HashMap<>();
        double[] daily = new double[7];
        String[] dayNames = new String[7];
        java.text.SimpleDateFormat parser = new java.text.SimpleDateFormat("dd MMM yyyy, HH:mm", Locale.getDefault());
        java.text.SimpleDateFormat dayFmt = new java.text.SimpleDateFormat("EEE", Locale.getDefault());
        java.util.Calendar today = java.util.Calendar.getInstance();
        today.set(java.util.Calendar.HOUR_OF_DAY,0); today.set(java.util.Calendar.MINUTE,0);
        today.set(java.util.Calendar.SECOND,0); today.set(java.util.Calendar.MILLISECOND,0);
        long todayMs = today.getTimeInMillis();
        for (int i=0;i<7;i++) {
            java.util.Calendar d=(java.util.Calendar)today.clone(); d.add(java.util.Calendar.DAY_OF_YEAR,i-6);
            dayNames[i]=dayFmt.format(d.getTime());
        }
        android.database.Cursor c = db.all();
        try {
            while(c.moveToNext()) {
                String dateText=c.getString(5);
                double amount=c.getDouble(2);
                boolean income=c.getInt(3)==1;
                String category=c.getString(4);
                boolean transfer=c.getColumnCount()>8 && c.getInt(8)==1;
                if (transfer) continue;
                if(dateText!=null && dateText.contains(month)) {
                    if(income) monthIncome+=amount;
                    else {
                        monthExpense+=amount;
                        String cat=(category==null||category.trim().isEmpty())?"Uncategorised":category;
                        categories.put(cat,categories.containsKey(cat)?categories.get(cat)+amount:amount);
                    }
                }
                try {
                    java.util.Date parsed=parser.parse(dateText);
                    if(parsed!=null) {
                        java.util.Calendar day=java.util.Calendar.getInstance(); day.setTime(parsed);
                        day.set(java.util.Calendar.HOUR_OF_DAY,0);day.set(java.util.Calendar.MINUTE,0);
                        day.set(java.util.Calendar.SECOND,0);day.set(java.util.Calendar.MILLISECOND,0);
                        long diff=(todayMs-day.getTimeInMillis())/86400000L;
                        if(diff>=0&&diff<7&&!income) daily[6-(int)diff]+=amount;
                    }
                } catch(Exception ignored) {}
            }
        } finally { c.close(); }

        LinearLayout monthCard=column();
        monthCard.setBackground(new GradientDrawable(GradientDrawable.Orientation.TL_BR,
            new int[]{Color.rgb(25,112,73),Color.rgb(19,82,57)}));
        ((GradientDrawable)monthCard.getBackground()).setCornerRadius(dp(24));
        pad(monthCard,18,18,18,18);
        LinearLayout heading=row();
        TextView eyebrow=label("MONTHLY SNAPSHOT",10,Color.rgb(207,235,217));eyebrow.setLetterSpacing(.12f);
        heading.addView(eyebrow,new LinearLayout.LayoutParams(0,-2,1));
        heading.addView(pill(month,Color.rgb(45,128,88),Color.WHITE));
        monthCard.addView(heading);gap(monthCard,16);
        monthCard.addView(label("Net this month",12,Color.rgb(207,235,217)));gap(monthCard,3);
        monthCard.addView(bold(money.format(monthIncome-monthExpense),30,Color.WHITE));gap(monthCard,16);
        View rule=new View(this);rule.setBackgroundColor(0x44ffffff);monthCard.addView(rule,lp(-1,1));gap(monthCard,14);
        LinearLayout metrics=row();
        LinearLayout inc=column(), exp=column(), rate=column();
        inc.addView(label("INCOME",10,Color.rgb(207,235,217)));inc.addView(bold(money.format(monthIncome),14,Color.WHITE));
        exp.addView(label("SPENT",10,Color.rgb(207,235,217)));exp.addView(bold(money.format(monthExpense),14,Color.WHITE));
        double savingsRate=monthIncome>0?((monthIncome-monthExpense)/monthIncome)*100:0;
        rate.addView(label("SAVINGS RATE",10,Color.rgb(207,235,217)));
        rate.addView(bold(monthIncome>0?String.format(Locale.getDefault(),"%.0f%%",savingsRate):"—",14,Color.WHITE));
        metrics.addView(inc,new LinearLayout.LayoutParams(0,-2,1));
        metrics.addView(exp,new LinearLayout.LayoutParams(0,-2,1));
        metrics.addView(rate,new LinearLayout.LayoutParams(0,-2,1));
        monthCard.addView(metrics);content.addView(monthCard);gap(content,18);

        LinearLayout trend=card();
        trend.addView(bold("Last 7 days",16,ink));gap(trend,4);
        trend.addView(label("Daily spending · today included",12,muted));gap(trend,16);
        double maxDaily=0;for(double v:daily)if(v>maxDaily)maxDaily=v;
        LinearLayout bars=row();bars.setGravity(Gravity.BOTTOM);
        for(int i=0;i<7;i++) {
            LinearLayout day=column();day.setGravity(Gravity.BOTTOM|Gravity.CENTER_HORIZONTAL);
            TextView val=label(daily[i]>0?compactMoney(daily[i]):"—",9,muted);val.setGravity(Gravity.CENTER);
            day.addView(val);gap(day,6);
            android.widget.FrameLayout track=new android.widget.FrameLayout(this);
            track.setBackground(shape(dark?Color.rgb(42,54,46):Color.rgb(237,242,238),8));
            int barHeight=maxDaily>0?Math.max(5,(int)(68*daily[i]/maxDaily)):5;
            View fill=new View(this);fill.setBackground(shape(green,8));
            android.widget.FrameLayout.LayoutParams fp=new android.widget.FrameLayout.LayoutParams(-1,dp(barHeight),Gravity.BOTTOM);
            track.addView(fill,fp);day.addView(track,lp(22,72));gap(day,7);
            TextView dayName=label(dayNames[i],10,muted);dayName.setGravity(Gravity.CENTER);day.addView(dayName);
            bars.addView(day,new LinearLayout.LayoutParams(0,-2,1));
        }
        trend.addView(bars);content.addView(trend);gap(content,18);

        LinearLayout categoryCard=card();
        categoryCard.addView(bold("Where it goes",16,ink));gap(categoryCard,4);
        categoryCard.addView(label("Top spending categories this month",12,muted));gap(categoryCard,12);
        java.util.ArrayList<java.util.Map.Entry<String,Double>> ranked=new java.util.ArrayList<>(categories.entrySet());
        java.util.Collections.sort(ranked,(a,b)->Double.compare(b.getValue(),a.getValue()));
        if(ranked.isEmpty()) {
            TextView empty=label("No expenses recorded this month yet.",13,muted);pad(empty,0,14,0,8);categoryCard.addView(empty);
        } else {
            double maxCategory=ranked.get(0).getValue();
            for(int i=0;i<Math.min(5,ranked.size());i++) {
                java.util.Map.Entry<String,Double> entry=ranked.get(i);
                LinearLayout lineRow=row();
                TextView name=bold(entry.getKey(),13,ink);
                lineRow.addView(name,new LinearLayout.LayoutParams(0,-2,1));
                lineRow.addView(label(money.format(entry.getValue()),12,ink));
                categoryCard.addView(lineRow);gap(categoryCard,7);
                android.widget.FrameLayout track=new android.widget.FrameLayout(this);
                track.setBackground(shape(dark?Color.rgb(42,54,46):Color.rgb(237,242,238),8));
                int width=(int)(Math.max(0.04,entry.getValue()/maxCategory)*Math.max(1,(getResources().getDisplayMetrics().widthPixels-dp(100))));
                View fill=new View(this);fill.setBackground(shape(i==0?green:Color.rgb(105,166,126),8));
                track.addView(fill,new android.widget.FrameLayout.LayoutParams(width,dp(7),Gravity.LEFT));
                categoryCard.addView(track,lp(-1,7));gap(categoryCard,12);
            }
        }
        content.addView(categoryCard);gap(content,14);
        double budgetLimit=getPreferences(MODE_PRIVATE).getFloat("monthly_budget",0f);
        if(budgetLimit>0) {
            LinearLayout budget=card();
            budget.addView(bold("Budget check",16,ink));gap(budget,6);
            double remaining=budgetLimit-monthExpense;
            budget.addView(label(remaining>=0?money.format(remaining)+" remaining in your monthly budget":money.format(-remaining)+" over your monthly budget",13,remaining>=0?green:Color.rgb(196,83,77)));
            gap(budget,10);
            android.widget.FrameLayout track=new android.widget.FrameLayout(this);
            track.setBackground(shape(softRed,8));
            int width=(int)(Math.min(1,monthExpense/budgetLimit)*Math.max(1,(getResources().getDisplayMetrics().widthPixels-dp(100))));
            View fill=new View(this);fill.setBackground(shape(monthExpense>budgetLimit?Color.rgb(196,83,77):green,8));
            track.addView(fill,new android.widget.FrameLayout.LayoutParams(width,dp(8),Gravity.LEFT));
            budget.addView(track,lp(-1,8));content.addView(budget);
        }
    }

    private String compactMoney(double value) {
        if(value>=100000) return String.format(Locale.getDefault(),"%.1fL",value/100000);
        if(value>=1000) return String.format(Locale.getDefault(),"%.1fk",value/1000);
        return String.format(Locale.getDefault(),"%.0f",value);
    }

    private void buildSettings() {
        buildTop("Make it yours","Settings","Simple controls. Private by design.");
        LinearLayout appearance=card();
        appearance.addView(bold("Appearance",16,ink));gap(appearance,6);
        appearance.addView(label("Choose the look that feels right.",12,muted));gap(appearance,14);
        LinearLayout mode=row();
        LinearLayout light=column();light.setGravity(Gravity.CENTER);pad(light,8,12,8,12);
        light.setBackground(strokeShape(!dark?softGreen:surface,14,!dark?green:line));
        light.addView(bold("☀  Light",13,ink)); light.setOnClickListener(v->setDark(false));
        LinearLayout night=column();night.setGravity(Gravity.CENTER);pad(night,8,12,8,12);
        night.setBackground(strokeShape(dark?softGreen:surface,14,dark?green:line));
        night.addView(bold("☾  Dark",13,ink)); night.setOnClickListener(v->setDark(true));
        mode.addView(light,new LinearLayout.LayoutParams(0,-2,1));View gap=new View(this);mode.addView(gap,lp(10,1));mode.addView(night,new LinearLayout.LayoutParams(0,-2,1));appearance.addView(mode);
        content.addView(appearance);gap(content,14);

        LinearLayout privacy=card();privacy.addView(bold("Privacy & permissions",16,ink));gap(privacy,5);
        privacy.addView(label("MoneyGrow stores transactions in a local database on this phone. It has no account, cloud sync, analytics or internet permission.",12,muted));gap(privacy,14);
        addSettingAction(privacy,"Notification access","Optional payment alert detection","Manage",()->notificationDialog());
        divider(privacy);
        addSettingAction(privacy,"Back up transactions","Save an encrypted-by-you file wherever you choose","Export",()->createBackup());
        divider(privacy);
        addSettingAction(privacy,"Restore transactions","Replace this phone's transaction list from a backup","Import",()->chooseBackup());
        divider(privacy);
        addSettingAction(privacy,"Delete transaction history","Permanently remove all saved entries","Delete",()->deleteDialog());
        content.addView(privacy);gap(content,14);

        LinearLayout movement=card();
        movement.addView(bold("Money movement",16,ink));gap(movement,5);
        movement.addView(label("Record money moved between your own accounts without counting it as income or spending.",12,muted));gap(movement,10);
        addSettingAction(movement,"Record a transfer","Cash, savings, or another account","Add",()->transferDialog());
        content.addView(movement);gap(content,14);

        LinearLayout about=card();about.addView(bold("About MoneyGrow",16,ink));gap(about,7);
        about.addView(label("Version 1.0 · Local-first finance tracker",12,muted));gap(about,12);
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
        String[] names={"Home","Activity","Insights","Settings"};
        String[] icons={"⌂","↕","◔","⚙"};
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
            .setMessage("Turn this on to import new UPI/payment alerts from supported apps such as Google Pay, PhonePe, Paytm and participating bank apps. Android only lets MoneyGrow read notifications after you grant access; it cannot directly fetch your UPI or bank history. It will not import past transactions, and alerts that are hidden, disabled or worded differently may be missed. MoneyGrow saves only a generic transaction label, amount, direction, category, date and app package on this phone; it does not save raw notification text or upload data. Review detected entries for mistakes.")
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


    private void createBackup() {
        Intent intent = new Intent(Intent.ACTION_CREATE_DOCUMENT);
        intent.addCategory(Intent.CATEGORY_OPENABLE);
        intent.setType("application/json");
        intent.putExtra(Intent.EXTRA_TITLE, "MoneyGrow-backup.json");
        startActivityForResult(intent, REQUEST_CREATE_BACKUP);
    }

    private void chooseBackup() {
        Intent intent = new Intent(Intent.ACTION_OPEN_DOCUMENT);
        intent.addCategory(Intent.CATEGORY_OPENABLE);
        intent.setType("application/json");
        startActivityForResult(intent, REQUEST_RESTORE_BACKUP);
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        if (resultCode != RESULT_OK || data == null || data.getData() == null) return;
        if (requestCode == REQUEST_CREATE_BACKUP) {
            try (OutputStream output = getContentResolver().openOutputStream(data.getData(), "wt")) {
                if (output == null) throw new IllegalStateException("Could not open the selected backup destination.");
                db.writeBackup(output);
                new AlertDialog.Builder(this)
                    .setTitle("Backup created")
                    .setMessage("Your transaction backup was saved. Keep it somewhere safe; anyone with the file may be able to read its contents.")
                    .setPositiveButton("OK", null).show();
            } catch (Exception e) {
                showBackupError("Could not create the backup. Please choose another location and try again.");
            }
        } else if (requestCode == REQUEST_RESTORE_BACKUP) {
            byte[] backup;
            try (InputStream input = getContentResolver().openInputStream(data.getData())) {
                if (input == null) throw new IllegalStateException("Could not open the selected file.");
                ByteArrayOutputStream buffer = new ByteArrayOutputStream();
                byte[] chunk = new byte[8192];
                int count;
                while ((count = input.read(chunk)) != -1) {
                    if (buffer.size() + count > 10 * 1024 * 1024) {
                        throw new IllegalArgumentException("Backup is larger than 10 MB.");
                    }
                    buffer.write(chunk, 0, count);
                }
                backup = buffer.toByteArray();
            } catch (Exception e) {
                showBackupError("Could not read this backup. Select a valid MoneyGrow JSON backup under 10 MB.");
                return;
            }

            final byte[] selectedBackup = backup;
            new AlertDialog.Builder(this)
                .setTitle("Replace saved transactions?")
                .setMessage("Restoring replaces every transaction currently stored on this phone. This cannot be undone. Create a backup of your current data first if you may need it.")
                .setNegativeButton("Cancel", null)
                .setPositiveButton("Restore", (dialog, which) -> {
                    try {
                        int restored = db.restoreBackup(new ByteArrayInputStream(selectedBackup));
                        render();
                        new AlertDialog.Builder(this)
                            .setTitle("Restore complete")
                            .setMessage(restored + " transaction(s) restored.")
                            .setPositiveButton("OK", null).show();
                    } catch (Exception e) {
                        showBackupError("This file is invalid or unsupported. Your existing transactions were not changed.");
                    }
                }).show();
        }
    }

    private void showBackupError(String message) {
        new AlertDialog.Builder(this).setTitle("Backup problem").setMessage(message)
            .setPositiveButton("OK", null).show();
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
