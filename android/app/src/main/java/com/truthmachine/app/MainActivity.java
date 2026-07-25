package com.truthmachine.app;

import android.app.WallpaperManager;
import android.content.ComponentName;
import android.content.Intent;
import android.graphics.Color;
import android.net.Uri;
import android.os.Bundle;
import android.provider.Settings;
import android.widget.TextView;

import androidx.appcompat.app.AppCompatActivity;

import com.google.android.material.button.MaterialButton;
import com.google.android.material.button.MaterialButtonToggleGroup;
import com.google.android.material.snackbar.Snackbar;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.Locale;

public final class MainActivity extends AppCompatActivity {
    private static final String WEBSITE = "https://truth-machine-coral.vercel.app/";
    private static final String ATLAS = "https://truth-machine-coral.vercel.app/#evolution-tree";

    private Quote quote;
    private TextView quoteText;
    private TextView truthText;
    private TextView previewQuote;
    private TextView dateLabel;
    private TextView previewDate;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        getWindow().setStatusBarColor(Color.parseColor("#03110F"));
        getWindow().setNavigationBarColor(Color.parseColor("#03110F"));
        setContentView(R.layout.activity_main);

        quoteText = findViewById(R.id.quoteText);
        truthText = findViewById(R.id.truthText);
        previewQuote = findViewById(R.id.previewQuote);
        dateLabel = findViewById(R.id.dateLabel);
        previewDate = findViewById(R.id.previewDate);

        MaterialButton applyButton = findViewById(R.id.applyWallpaperButton);
        MaterialButton shareButton = findViewById(R.id.shareButton);
        MaterialButton openWebsiteButton = findViewById(R.id.openWebsiteButton);
        MaterialButton openAtlasButton = findViewById(R.id.openAtlasButton);
        MaterialButtonToggleGroup themeGroup = findViewById(R.id.themeGroup);

        renderToday();

        applyButton.setOnClickListener(view -> openWallpaperPicker());
        shareButton.setOnClickListener(view -> shareToday());
        openWebsiteButton.setOnClickListener(view -> openUrl(WEBSITE));
        openAtlasButton.setOnClickListener(view -> openUrl(ATLAS));

        restoreThemeSelection(themeGroup);
        themeGroup.addOnButtonCheckedListener((group, checkedId, isChecked) -> {
            if (!isChecked) {
                return;
            }
            String theme = themeForButton(checkedId);
            WallpaperPreferences.setTheme(this, theme);
            stylePreview(theme);
            Snackbar.make(group, "Wallpaper mood saved. Re-apply to preview it in the system picker.", Snackbar.LENGTH_SHORT).show();
        });
    }

    @Override
    protected void onResume() {
        super.onResume();
        renderToday();
    }

    private void renderToday() {
        LocalDate today = LocalDate.now();
        quote = QuoteRepository.forDate(today);

        String date = today.format(DateTimeFormatter.ofPattern("EEEE · d MMMM", Locale.ENGLISH)).toUpperCase(Locale.ENGLISH);
        dateLabel.setText(date);
        previewDate.setText(date);
        quoteText.setText("“" + quote.line() + "”");
        truthText.setText(quote.evidence());
        previewQuote.setText(quote.line());
    }

    private void openWallpaperPicker() {
        ComponentName service = new ComponentName(this, DailyQuoteWallpaperService.class);
        Intent direct = new Intent(WallpaperManager.ACTION_CHANGE_LIVE_WALLPAPER);
        direct.putExtra(WallpaperManager.EXTRA_LIVE_WALLPAPER_COMPONENT, service);

        try {
            startActivity(direct);
        } catch (Exception directPickerUnavailable) {
            try {
                startActivity(new Intent(WallpaperManager.ACTION_LIVE_WALLPAPER_CHOOSER));
            } catch (Exception pickerUnavailable) {
                Snackbar.make(
                    findViewById(R.id.rootScroll),
                    "Open Android Settings → Wallpaper → Live wallpapers → Daily Truth Wallpaper.",
                    Snackbar.LENGTH_LONG
                ).setAction("Settings", view -> startActivity(new Intent(Settings.ACTION_SETTINGS))).show();
            }
        }
    }

    private void shareToday() {
        String content = "“" + quote.line() + "”\n\nEvidence check: " + quote.evidence() + "\n\n— The Truth Machine\n" + WEBSITE;
        Intent share = new Intent(Intent.ACTION_SEND);
        share.setType("text/plain");
        share.putExtra(Intent.EXTRA_TEXT, content);
        startActivity(Intent.createChooser(share, "Share today’s reality check"));
    }

    private void openUrl(String url) {
        try {
            startActivity(new Intent(Intent.ACTION_VIEW, Uri.parse(url)));
        } catch (Exception ignored) {
            Snackbar.make(findViewById(R.id.rootScroll), "No browser is available on this device.", Snackbar.LENGTH_SHORT).show();
        }
    }

    private void restoreThemeSelection(MaterialButtonToggleGroup themeGroup) {
        String theme = WallpaperPreferences.getTheme(this);
        int checkedId;
        if (WallpaperPreferences.THEME_AURORA.equals(theme)) {
            checkedId = R.id.themeAurora;
        } else if (WallpaperPreferences.THEME_DAWN.equals(theme)) {
            checkedId = R.id.themeDawn;
        } else {
            checkedId = R.id.themeAbyss;
        }
        themeGroup.check(checkedId);
        stylePreview(theme);
    }

    private String themeForButton(int checkedId) {
        if (checkedId == R.id.themeAurora) {
            return WallpaperPreferences.THEME_AURORA;
        }
        if (checkedId == R.id.themeDawn) {
            return WallpaperPreferences.THEME_DAWN;
        }
        return WallpaperPreferences.THEME_ABYSS;
    }

    private void stylePreview(String theme) {
        int quoteColour = Color.parseColor("#EDFFF8");
        int dateColour;
        if (WallpaperPreferences.THEME_DAWN.equals(theme)) {
            dateColour = Color.parseColor("#FFB648");
        } else if (WallpaperPreferences.THEME_AURORA.equals(theme)) {
            dateColour = Color.parseColor("#78BFFF");
        } else {
            dateColour = Color.parseColor("#4FF0C4");
        }
        previewQuote.setTextColor(quoteColour);
        previewDate.setTextColor(dateColour);
    }
}
