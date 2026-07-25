package com.truthmachine.app;

import android.content.Context;
import android.content.SharedPreferences;

public final class WallpaperPreferences {
    public static final String THEME_ABYSS = "abyss";
    public static final String THEME_AURORA = "aurora";
    public static final String THEME_DAWN = "dawn";

    private static final String FILE_NAME = "truth_wallpaper";
    private static final String KEY_THEME = "theme";

    private WallpaperPreferences() {
    }

    public static void setTheme(Context context, String theme) {
        preferences(context).edit().putString(KEY_THEME, theme).apply();
    }

    public static String getTheme(Context context) {
        return preferences(context).getString(KEY_THEME, THEME_ABYSS);
    }

    private static SharedPreferences preferences(Context context) {
        return context.getSharedPreferences(FILE_NAME, Context.MODE_PRIVATE);
    }
}
