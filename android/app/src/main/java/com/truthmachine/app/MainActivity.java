package com.truthmachine.app;

import android.annotation.SuppressLint;
import android.app.DownloadManager;
import android.content.ContentValues;
import android.content.Context;
import android.content.Intent;
import android.graphics.Color;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.os.Environment;
import android.provider.MediaStore;
import android.util.Base64;
import android.view.View;
import android.webkit.CookieManager;
import android.webkit.JavascriptInterface;
import android.webkit.URLUtil;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceError;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.ProgressBar;
import android.widget.Toast;

import androidx.annotation.Nullable;
import androidx.appcompat.app.AppCompatActivity;

import com.google.android.material.bottomnavigation.BottomNavigationView;
import com.google.android.material.button.MaterialButton;

import org.json.JSONObject;

import java.io.File;
import java.io.FileOutputStream;
import java.io.OutputStream;
import java.nio.charset.StandardCharsets;
import java.util.Locale;

public final class MainActivity extends AppCompatActivity {
    public static final String EXTRA_START_URL = "com.truthmachine.app.START_URL";

    private static final String BASE_URL = "https://truth-machine-coral.vercel.app/";
    private static final String ANCESTRY_URL = BASE_URL + "ancestry";
    private static final String ATLAS_URL = BASE_URL + "#evolution-tree";
    private static final String INTERNAL_HOST = "truth-machine-coral.vercel.app";
    private static final int FILE_CHOOSER_REQUEST = 4107;

    private WebView webView;
    private ProgressBar pageProgress;
    private View offlinePanel;
    private BottomNavigationView bottomNavigation;
    private ValueCallback<Uri[]> pendingFileChooser;
    private boolean updatingNavigation;

    @SuppressLint({"SetJavaScriptEnabled", "AddJavascriptInterface"})
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        getWindow().setStatusBarColor(Color.parseColor("#03110F"));
        getWindow().setNavigationBarColor(Color.parseColor("#03110F"));
        setContentView(R.layout.activity_explore);

        webView = findViewById(R.id.webView);
        pageProgress = findViewById(R.id.pageProgress);
        offlinePanel = findViewById(R.id.offlinePanel);
        bottomNavigation = findViewById(R.id.bottomNavigation);
        MaterialButton retryButton = findViewById(R.id.retryButton);

        configureWebView();
        configureNavigation();
        retryButton.setOnClickListener(view -> webView.reload());

        if (savedInstanceState != null && webView.restoreState(savedInstanceState) != null) {
            syncNavigation(webView.getUrl());
        } else {
            loadRequestedUrl(getIntent());
        }
    }

    @Override
    protected void onNewIntent(Intent intent) {
        super.onNewIntent(intent);
        setIntent(intent);
        loadRequestedUrl(intent);
    }

    @Override
    protected void onSaveInstanceState(Bundle outState) {
        webView.saveState(outState);
        super.onSaveInstanceState(outState);
    }

    @Override
    protected void onDestroy() {
        if (pendingFileChooser != null) {
            pendingFileChooser.onReceiveValue(null);
            pendingFileChooser = null;
        }
        if (webView != null) {
            webView.removeJavascriptInterface("AndroidApp");
            webView.removeJavascriptInterface("AndroidDownloads");
            webView.stopLoading();
            webView.setWebChromeClient(null);
            webView.setWebViewClient(null);
            webView.destroy();
        }
        super.onDestroy();
    }

    @Override
    public void onBackPressed() {
        if (webView.canGoBack()) {
            webView.goBack();
        } else {
            super.onBackPressed();
        }
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, @Nullable Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        if (requestCode != FILE_CHOOSER_REQUEST || pendingFileChooser == null) return;

        Uri[] result = null;
        if (resultCode == RESULT_OK && data != null) {
            if (data.getClipData() != null) {
                int count = data.getClipData().getItemCount();
                result = new Uri[count];
                for (int i = 0; i < count; i++) {
                    result[i] = data.getClipData().getItemAt(i).getUri();
                }
            } else if (data.getData() != null) {
                result = new Uri[]{data.getData()};
            }
        }

        pendingFileChooser.onReceiveValue(result);
        pendingFileChooser = null;
    }

    @SuppressLint("SetJavaScriptEnabled")
    private void configureWebView() {
        WebSettings settings = webView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setDatabaseEnabled(true);
        settings.setAllowFileAccess(false);
        settings.setAllowContentAccess(true);
        settings.setLoadsImagesAutomatically(true);
        settings.setLoadWithOverviewMode(false);
        settings.setUseWideViewPort(true);
        settings.setBuiltInZoomControls(false);
        settings.setDisplayZoomControls(false);
        settings.setSupportMultipleWindows(false);
        settings.setJavaScriptCanOpenWindowsAutomatically(true);
        settings.setMediaPlaybackRequiresUserGesture(true);
        settings.setMixedContentMode(WebSettings.MIXED_CONTENT_NEVER_ALLOW);
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            settings.setSafeBrowsingEnabled(true);
        }

        CookieManager.getInstance().setAcceptCookie(true);
        CookieManager.getInstance().setAcceptThirdPartyCookies(webView, false);
        webView.setBackgroundColor(Color.parseColor("#03110F"));
        webView.addJavascriptInterface(new AppBridge(), "AndroidApp");
        webView.addJavascriptInterface(new DownloadBridge(), "AndroidDownloads");

        webView.setWebViewClient(new WebViewClient() {
            @Override
            public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                return handleNavigation(request.getUrl());
            }

            @Override
            public void onPageStarted(WebView view, String url, android.graphics.Bitmap favicon) {
                pageProgress.setVisibility(View.VISIBLE);
                offlinePanel.setVisibility(View.GONE);
            }

            @Override
            public void onPageFinished(WebView view, String url) {
                pageProgress.setVisibility(View.GONE);
                offlinePanel.setVisibility(View.GONE);
                syncNavigation(url);
                injectAndroidCapabilities();
            }

            @Override
            public void onReceivedError(WebView view, WebResourceRequest request, WebResourceError error) {
                if (request.isForMainFrame()) {
                    pageProgress.setVisibility(View.GONE);
                    offlinePanel.setVisibility(View.VISIBLE);
                }
            }
        });

        webView.setWebChromeClient(new WebChromeClient() {
            @Override
            public void onProgressChanged(WebView view, int newProgress) {
                pageProgress.setProgress(newProgress);
                pageProgress.setVisibility(newProgress >= 100 ? View.GONE : View.VISIBLE);
            }

            @Override
            public boolean onShowFileChooser(
                WebView webView,
                ValueCallback<Uri[]> filePathCallback,
                FileChooserParams fileChooserParams
            ) {
                if (pendingFileChooser != null) pendingFileChooser.onReceiveValue(null);
                pendingFileChooser = filePathCallback;
                try {
                    Intent intent = fileChooserParams.createIntent();
                    intent.addCategory(Intent.CATEGORY_OPENABLE);
                    startActivityForResult(intent, FILE_CHOOSER_REQUEST);
                    return true;
                } catch (Exception error) {
                    pendingFileChooser = null;
                    Toast.makeText(MainActivity.this, R.string.file_picker_unavailable, Toast.LENGTH_SHORT).show();
                    return false;
                }
            }
        });

        webView.setDownloadListener((url, userAgent, contentDisposition, mimeType, contentLength) -> {
            if (url != null && url.startsWith("blob:")) {
                saveBlobUrl(url, URLUtil.guessFileName(url, contentDisposition, mimeType), mimeType);
            } else {
                enqueueDownload(url, userAgent, contentDisposition, mimeType);
            }
        });
    }

    private void configureNavigation() {
        bottomNavigation.setOnItemSelectedListener(item -> {
            if (updatingNavigation) return true;
            int id = item.getItemId();
            if (id == R.id.navigation_home) {
                loadInternal(BASE_URL);
            } else if (id == R.id.navigation_ancestry) {
                loadInternal(ANCESTRY_URL);
            } else if (id == R.id.navigation_atlas) {
                loadInternal(ATLAS_URL);
            } else if (id == R.id.navigation_wallpaper) {
                startActivity(new Intent(this, WallpaperActivity.class));
            }
            return true;
        });
    }

    private void loadRequestedUrl(Intent intent) {
        String requested = intent == null ? null : intent.getStringExtra(EXTRA_START_URL);
        if (requested == null || !isInternalUrl(requested)) requested = BASE_URL;
        loadInternal(requested);
    }

    private void loadInternal(String url) {
        offlinePanel.setVisibility(View.GONE);
        webView.loadUrl(url);
    }

    private boolean handleNavigation(Uri uri) {
        if (uri == null) return false;
        String scheme = uri.getScheme() == null ? "" : uri.getScheme().toLowerCase(Locale.ROOT);
        if ("http".equals(scheme) || "https".equals(scheme)) {
            if (INTERNAL_HOST.equalsIgnoreCase(uri.getHost())) return false;
            openExternal(uri);
            return true;
        }
        if ("blob".equals(scheme) || "data".equals(scheme) || "about".equals(scheme)) return false;
        openExternal(uri);
        return true;
    }

    private boolean isInternalUrl(String url) {
        try {
            return INTERNAL_HOST.equalsIgnoreCase(Uri.parse(url).getHost());
        } catch (Exception ignored) {
            return false;
        }
    }

    private void openExternal(Uri uri) {
        try {
            startActivity(new Intent(Intent.ACTION_VIEW, uri));
        } catch (Exception error) {
            Toast.makeText(this, R.string.external_app_unavailable, Toast.LENGTH_SHORT).show();
        }
    }

    private void syncNavigation(String url) {
        if (url == null) return;
        int target = R.id.navigation_home;
        if (url.contains("/ancestry")) target = R.id.navigation_ancestry;
        else if (url.contains("#evolution-tree")) target = R.id.navigation_atlas;

        updatingNavigation = true;
        bottomNavigation.setSelectedItemId(target);
        updatingNavigation = false;
    }

    private void injectAndroidCapabilities() {
        String script = "(function(){" +
            "if(window.__truthMachineAndroidBridge)return;" +
            "window.__truthMachineAndroidBridge=true;" +
            "if(!navigator.share){navigator.share=function(data){AndroidApp.share(JSON.stringify(data||{}));return Promise.resolve();};}" +
            "var save=async function(url,name){try{var response=await fetch(url);var blob=await response.blob();var reader=new FileReader();reader.onloadend=function(){AndroidDownloads.save(String(reader.result),name||'truth-machine-download',blob.type||'application/octet-stream');};reader.readAsDataURL(blob);}catch(error){AndroidDownloads.failed();}};" +
            "var originalClick=HTMLAnchorElement.prototype.click;" +
            "HTMLAnchorElement.prototype.click=function(){if(this.href&&this.href.indexOf('blob:')===0){save(this.href,this.download);return;}return originalClick.apply(this,arguments);};" +
            "document.addEventListener('click',function(event){var link=event.target&&event.target.closest?event.target.closest('a[download]'):null;if(link&&link.href&&link.href.indexOf('blob:')===0){event.preventDefault();save(link.href,link.download);}},true);" +
            "})();";
        webView.evaluateJavascript(script, null);
    }

    private void saveBlobUrl(String url, String fileName, String mimeType) {
        String script = "(async function(){try{" +
            "var response=await fetch(" + JSONObject.quote(url) + ");" +
            "var blob=await response.blob();var reader=new FileReader();" +
            "reader.onloadend=function(){AndroidDownloads.save(String(reader.result)," + JSONObject.quote(fileName) + ",blob.type||" + JSONObject.quote(mimeType == null ? "application/octet-stream" : mimeType) + ");};" +
            "reader.readAsDataURL(blob);" +
            "}catch(error){AndroidDownloads.failed();}})();";
        webView.evaluateJavascript(script, null);
    }

    private void enqueueDownload(String url, String userAgent, String contentDisposition, String mimeType) {
        if (url == null || url.isBlank()) return;
        try {
            String fileName = sanitizeFileName(URLUtil.guessFileName(url, contentDisposition, mimeType));
            DownloadManager.Request request = new DownloadManager.Request(Uri.parse(url));
            request.setMimeType(mimeType);
            request.setTitle(fileName);
            request.setDescription(getString(R.string.download_description));
            request.setNotificationVisibility(DownloadManager.Request.VISIBILITY_VISIBLE_NOTIFY_COMPLETED);
            request.setAllowedOverMetered(true);
            request.setAllowedOverRoaming(false);
            request.setDestinationInExternalPublicDir(Environment.DIRECTORY_DOWNLOADS, "Truth Machine/" + fileName);
            if (userAgent != null) request.addRequestHeader("User-Agent", userAgent);
            String cookies = CookieManager.getInstance().getCookie(url);
            if (cookies != null) request.addRequestHeader("Cookie", cookies);
            DownloadManager manager = (DownloadManager) getSystemService(Context.DOWNLOAD_SERVICE);
            manager.enqueue(request);
            Toast.makeText(this, getString(R.string.download_started, fileName), Toast.LENGTH_SHORT).show();
        } catch (Exception error) {
            Toast.makeText(this, R.string.download_failed, Toast.LENGTH_SHORT).show();
        }
    }

    private String sanitizeFileName(String fileName) {
        String safe = fileName == null ? "truth-machine-download" : fileName.replaceAll("[\\\\/:*?\"<>|]", "_").trim();
        return safe.isEmpty() ? "truth-machine-download" : safe;
    }

    private final class AppBridge {
        @JavascriptInterface
        public void share(String payload) {
            runOnUiThread(() -> {
                try {
                    JSONObject data = new JSONObject(payload);
                    String text = data.optString("text", "");
                    String url = data.optString("url", "");
                    String title = data.optString("title", getString(R.string.app_name));
                    String combined = text;
                    if (!url.isBlank() && !text.contains(url)) combined = text.isBlank() ? url : text + "\n\n" + url;
                    Intent share = new Intent(Intent.ACTION_SEND);
                    share.setType("text/plain");
                    share.putExtra(Intent.EXTRA_SUBJECT, title);
                    share.putExtra(Intent.EXTRA_TEXT, combined);
                    startActivity(Intent.createChooser(share, getString(R.string.share_from_truth_machine)));
                } catch (Exception error) {
                    Toast.makeText(MainActivity.this, R.string.share_failed, Toast.LENGTH_SHORT).show();
                }
            });
        }
    }

    private final class DownloadBridge {
        @JavascriptInterface
        public void save(String dataUrl, String requestedName, String mimeType) {
            try {
                int comma = dataUrl == null ? -1 : dataUrl.indexOf(',');
                if (comma < 0) throw new IllegalArgumentException("Invalid data URL");
                String metadata = dataUrl.substring(0, comma);
                String payload = dataUrl.substring(comma + 1);
                byte[] bytes = metadata.contains(";base64")
                    ? Base64.decode(payload, Base64.DEFAULT)
                    : Uri.decode(payload).getBytes(StandardCharsets.UTF_8);
                String fileName = sanitizeFileName(requestedName);
                writeDownloadedFile(bytes, fileName, mimeType);
                runOnUiThread(() -> Toast.makeText(MainActivity.this, getString(R.string.download_saved, fileName), Toast.LENGTH_LONG).show());
            } catch (Exception error) {
                failed();
            }
        }

        @JavascriptInterface
        public void failed() {
            runOnUiThread(() -> Toast.makeText(MainActivity.this, R.string.download_failed, Toast.LENGTH_SHORT).show());
        }
    }

    private void writeDownloadedFile(byte[] bytes, String fileName, String mimeType) throws Exception {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            ContentValues values = new ContentValues();
            values.put(MediaStore.Downloads.DISPLAY_NAME, fileName);
            values.put(MediaStore.Downloads.MIME_TYPE, mimeType == null || mimeType.isBlank() ? "application/octet-stream" : mimeType);
            values.put(MediaStore.Downloads.RELATIVE_PATH, Environment.DIRECTORY_DOWNLOADS + "/Truth Machine");
            values.put(MediaStore.Downloads.IS_PENDING, 1);
            Uri destination = getContentResolver().insert(MediaStore.Downloads.EXTERNAL_CONTENT_URI, values);
            if (destination == null) throw new IllegalStateException("Unable to create download");
            try (OutputStream output = getContentResolver().openOutputStream(destination)) {
                if (output == null) throw new IllegalStateException("Unable to open download");
                output.write(bytes);
            }
            values.clear();
            values.put(MediaStore.Downloads.IS_PENDING, 0);
            getContentResolver().update(destination, values, null, null);
        } else {
            File root = getExternalFilesDir(Environment.DIRECTORY_DOWNLOADS);
            if (root == null) root = getFilesDir();
            File directory = new File(root, "Truth Machine");
            if (!directory.exists() && !directory.mkdirs()) throw new IllegalStateException("Unable to create download directory");
            try (OutputStream output = new FileOutputStream(new File(directory, fileName))) {
                output.write(bytes);
            }
        }
    }
}
