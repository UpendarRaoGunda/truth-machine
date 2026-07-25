package com.truthmachine.app;

import android.graphics.Canvas;
import android.graphics.Color;
import android.graphics.LinearGradient;
import android.graphics.Paint;
import android.graphics.RadialGradient;
import android.graphics.Shader;
import android.os.Handler;
import android.os.Looper;
import android.service.wallpaper.WallpaperService;
import android.text.Layout;
import android.text.StaticLayout;
import android.text.TextPaint;
import android.view.SurfaceHolder;

import java.time.Duration;
import java.time.LocalDate;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Locale;

public final class DailyQuoteWallpaperService extends WallpaperService {
    @Override
    public Engine onCreateEngine() {
        return new QuoteEngine();
    }

    private final class QuoteEngine extends Engine {
        private final Handler handler = new Handler(Looper.getMainLooper());
        private final Paint paint = new Paint(Paint.ANTI_ALIAS_FLAG);
        private final TextPaint textPaint = new TextPaint(Paint.ANTI_ALIAS_FLAG);
        private boolean visible;
        private float horizontalOffset = 0.5f;

        private final Runnable midnightRefresh = new Runnable() {
            @Override
            public void run() {
                drawFrame();
                scheduleMidnightRefresh();
            }
        };

        @Override
        public void onVisibilityChanged(boolean isVisible) {
            visible = isVisible;
            if (visible) {
                drawFrame();
                scheduleMidnightRefresh();
            } else {
                handler.removeCallbacks(midnightRefresh);
            }
        }

        @Override
        public void onSurfaceChanged(SurfaceHolder holder, int format, int width, int height) {
            super.onSurfaceChanged(holder, format, width, height);
            drawFrame();
        }

        @Override
        public void onSurfaceRedrawNeeded(SurfaceHolder holder) {
            super.onSurfaceRedrawNeeded(holder);
            drawFrame();
        }

        @Override
        public void onSurfaceDestroyed(SurfaceHolder holder) {
            super.onSurfaceDestroyed(holder);
            visible = false;
            handler.removeCallbacks(midnightRefresh);
        }

        @Override
        public void onOffsetsChanged(
            float xOffset,
            float yOffset,
            float xOffsetStep,
            float yOffsetStep,
            int xPixelOffset,
            int yPixelOffset
        ) {
            horizontalOffset = xOffset;
            drawFrame();
        }

        private void scheduleMidnightRefresh() {
            handler.removeCallbacks(midnightRefresh);
            ZonedDateTime now = ZonedDateTime.now();
            ZonedDateTime next = now.toLocalDate().plusDays(1).atStartOfDay(now.getZone()).plusSeconds(2);
            long delay = Math.max(1_000L, Duration.between(now, next).toMillis());
            handler.postDelayed(midnightRefresh, delay);
        }

        private void drawFrame() {
            SurfaceHolder holder = getSurfaceHolder();
            Canvas canvas = null;
            try {
                canvas = holder.lockCanvas();
                if (canvas == null) {
                    return;
                }
                render(canvas);
            } finally {
                if (canvas != null) {
                    holder.unlockCanvasAndPost(canvas);
                }
            }
        }

        private void render(Canvas canvas) {
            int width = canvas.getWidth();
            int height = canvas.getHeight();
            String theme = WallpaperPreferences.getTheme(DailyQuoteWallpaperService.this);
            Palette palette = Palette.forTheme(theme);

            paint.setShader(new LinearGradient(
                0,
                0,
                width,
                height,
                palette.backgroundStart,
                palette.backgroundEnd,
                Shader.TileMode.CLAMP
            ));
            canvas.drawRect(0, 0, width, height, paint);
            paint.setShader(null);

            drawAmbientGlow(canvas, width, height, palette);

            float side = Math.max(34f, width * 0.085f);
            float contentWidth = width - side * 2f;
            float centreX = width / 2f;
            float safeTop = Math.max(90f, height * 0.14f);
            float quoteTop = height * 0.30f;
            float truthTop = height * 0.67f;

            String date = LocalDate.now()
                .format(DateTimeFormatter.ofPattern("EEEE · d MMMM", Locale.ENGLISH))
                .toUpperCase(Locale.ENGLISH);

            drawCentredText(
                canvas,
                date,
                centreX,
                safeTop,
                Math.max(26f, width * 0.033f),
                palette.accent,
                true
            );

            Quote quote = QuoteRepository.today();
            textPaint.setColor(palette.primaryText);
            textPaint.setTextSize(Math.max(48f, Math.min(76f, width * 0.074f)));
            textPaint.setFakeBoldText(true);

            StaticLayout quoteLayout = StaticLayout.Builder
                .obtain(quote.line(), 0, quote.line().length(), textPaint, (int) contentWidth)
                .setAlignment(Layout.Alignment.ALIGN_CENTER)
                .setLineSpacing(10f, 1f)
                .setIncludePad(false)
                .setMaxLines(7)
                .build();

            canvas.save();
            float parallax = (horizontalOffset - 0.5f) * width * 0.035f;
            canvas.translate(side + parallax, quoteTop);
            quoteLayout.draw(canvas);
            canvas.restore();

            paint.setColor(palette.divider);
            paint.setStrokeWidth(Math.max(2f, width * 0.0025f));
            float dividerWidth = contentWidth * 0.48f;
            canvas.drawLine(
                centreX - dividerWidth / 2f,
                truthTop - 34f,
                centreX + dividerWidth / 2f,
                truthTop - 34f,
                paint
            );

            textPaint.setColor(palette.secondaryText);
            textPaint.setTextSize(Math.max(26f, width * 0.035f));
            textPaint.setFakeBoldText(false);

            StaticLayout evidenceLayout = StaticLayout.Builder
                .obtain(quote.evidence(), 0, quote.evidence().length(), textPaint, (int) (contentWidth * 0.94f))
                .setAlignment(Layout.Alignment.ALIGN_CENTER)
                .setLineSpacing(7f, 1f)
                .setIncludePad(false)
                .setMaxLines(5)
                .build();

            canvas.save();
            canvas.translate((width - evidenceLayout.getWidth()) / 2f, truthTop);
            evidenceLayout.draw(canvas);
            canvas.restore();

            drawCentredText(
                canvas,
                "THE · TRUTH · MACHINE",
                centreX,
                height - Math.max(88f, height * 0.09f),
                Math.max(21f, width * 0.025f),
                palette.mutedText,
                true
            );
        }

        private void drawAmbientGlow(Canvas canvas, int width, int height, Palette palette) {
            float x = width * (0.66f + (horizontalOffset - 0.5f) * 0.14f);
            float y = height * 0.18f;
            float radius = Math.max(width, height) * 0.42f;

            paint.setShader(new RadialGradient(
                x,
                y,
                radius,
                palette.glow,
                Color.TRANSPARENT,
                Shader.TileMode.CLAMP
            ));
            canvas.drawCircle(x, y, radius, paint);
            paint.setShader(null);

            paint.setColor(palette.orbit);
            paint.setStyle(Paint.Style.STROKE);
            paint.setStrokeWidth(Math.max(2f, width * 0.002f));
            canvas.drawCircle(x, y, radius * 0.31f, paint);
            canvas.drawCircle(x, y, radius * 0.47f, paint);
            paint.setStyle(Paint.Style.FILL);
        }

        private void drawCentredText(
            Canvas canvas,
            String value,
            float x,
            float baseline,
            float size,
            int colour,
            boolean bold
        ) {
            textPaint.setColor(colour);
            textPaint.setTextSize(size);
            textPaint.setFakeBoldText(bold);
            textPaint.setTextAlign(Paint.Align.CENTER);
            canvas.drawText(value, x, baseline, textPaint);
            textPaint.setTextAlign(Paint.Align.LEFT);
        }
    }

    private static final class Palette {
        final int backgroundStart;
        final int backgroundEnd;
        final int accent;
        final int primaryText;
        final int secondaryText;
        final int mutedText;
        final int divider;
        final int glow;
        final int orbit;

        private Palette(
            int backgroundStart,
            int backgroundEnd,
            int accent,
            int primaryText,
            int secondaryText,
            int mutedText,
            int divider,
            int glow,
            int orbit
        ) {
            this.backgroundStart = backgroundStart;
            this.backgroundEnd = backgroundEnd;
            this.accent = accent;
            this.primaryText = primaryText;
            this.secondaryText = secondaryText;
            this.mutedText = mutedText;
            this.divider = divider;
            this.glow = glow;
            this.orbit = orbit;
        }

        static Palette forTheme(String theme) {
            if (WallpaperPreferences.THEME_AURORA.equals(theme)) {
                return new Palette(
                    Color.rgb(4, 13, 28),
                    Color.rgb(11, 35, 52),
                    Color.rgb(120, 191, 255),
                    Color.rgb(240, 251, 255),
                    Color.rgb(103, 235, 211),
                    Color.rgb(145, 178, 195),
                    Color.argb(110, 120, 191, 255),
                    Color.argb(92, 70, 121, 255),
                    Color.argb(80, 103, 235, 211)
                );
            }
            if (WallpaperPreferences.THEME_DAWN.equals(theme)) {
                return new Palette(
                    Color.rgb(33, 14, 19),
                    Color.rgb(72, 35, 31),
                    Color.rgb(255, 182, 72),
                    Color.rgb(255, 248, 235),
                    Color.rgb(255, 190, 177),
                    Color.rgb(211, 171, 159),
                    Color.argb(110, 255, 182, 72),
                    Color.argb(88, 255, 113, 101),
                    Color.argb(74, 255, 182, 72)
                );
            }
            return new Palette(
                Color.rgb(3, 17, 15),
                Color.rgb(8, 39, 33),
                Color.rgb(79, 240, 196),
                Color.rgb(237, 255, 248),
                Color.rgb(79, 240, 196),
                Color.rgb(146, 184, 174),
                Color.argb(110, 79, 240, 196),
                Color.argb(82, 79, 240, 196),
                Color.argb(66, 79, 240, 196)
            );
        }
    }
}
