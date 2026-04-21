package info.govexams.app

import android.annotation.SuppressLint
import android.content.Intent
import android.graphics.Bitmap
import android.net.Uri
import android.os.Bundle
import android.view.KeyEvent
import android.view.View
import android.webkit.*
import android.widget.ProgressBar
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.swiperefreshlayout.widget.SwipeRefreshLayout

class MainActivity : AppCompatActivity() {

    private lateinit var webView: WebView
    private lateinit var progressBar: ProgressBar
    private lateinit var swipeRefresh: SwipeRefreshLayout
    private lateinit var errorView: View
    private var hasError = false

    companion object {
        private const val WEBSITE_URL = "https://govexam.info/"
    }

    @SuppressLint("SetJavaScriptEnabled")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        // Initialize views
        webView = findViewById(R.id.webView)
        progressBar = findViewById(R.id.progressBar)
        swipeRefresh = findViewById(R.id.swipeRefresh)
        errorView = findViewById(R.id.errorView)

        // Setup SwipeRefresh
        swipeRefresh.setColorSchemeResources(R.color.primary)
        swipeRefresh.setOnRefreshListener {
            hasError = false
            errorView.visibility = View.GONE
            webView.visibility = View.VISIBLE
            webView.reload()
        }
        
        // Setup retry button
        errorView.findViewById<View>(R.id.btnRetry)?.setOnClickListener {
            hasError = false
            errorView.visibility = View.GONE
            webView.visibility = View.VISIBLE
            webView.loadUrl(WEBSITE_URL)
        }

        // Setup WebView
        setupWebView()

        // Load website
        webView.loadUrl(WEBSITE_URL)
    }

    @SuppressLint("SetJavaScriptEnabled")
    private fun setupWebView() {
        webView.settings.apply {
            javaScriptEnabled = true
            domStorageEnabled = true
            databaseEnabled = true
            cacheMode = WebSettings.LOAD_NO_CACHE
            setSupportZoom(true)
            builtInZoomControls = true
            displayZoomControls = false
            loadWithOverviewMode = true
            useWideViewPort = true
            allowFileAccess = true
            allowContentAccess = true
            mixedContentMode = WebSettings.MIXED_CONTENT_ALWAYS_ALLOW
            mediaPlaybackRequiresUserGesture = false
            
            // Remove WebView identifier from user agent
            userAgentString = "Mozilla/5.0 (Linux; Android 13) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36"
        }

        webView.setLayerType(View.LAYER_TYPE_HARDWARE, null)

        webView.webViewClient = object : WebViewClient() {
            override fun onPageStarted(view: WebView?, url: String?, favicon: Bitmap?) {
                super.onPageStarted(view, url, favicon)
                if (!hasError) {
                    progressBar.visibility = View.VISIBLE
                }
            }

            override fun onPageFinished(view: WebView?, url: String?) {
                super.onPageFinished(view, url)
                progressBar.visibility = View.GONE
                swipeRefresh.isRefreshing = false
                
                if (!hasError) {
                    errorView.visibility = View.GONE
                    webView.visibility = View.VISIBLE
                }
            }



            override fun onReceivedError(
                view: WebView?,
                request: WebResourceRequest?,
                error: WebResourceError?
            ) {
                if (request?.isForMainFrame == true) {
                    hasError = true

                    val code = error?.errorCode
                    val desc = error?.description
                    val url = request.url.toString()

                    android.util.Log.e("WEBVIEW_ERROR", "Code=$code Desc=$desc Url=$url")
                    Toast.makeText(
                        this@MainActivity,
                        "WebView error: $code - $desc",
                        Toast.LENGTH_LONG
                    ).show()

                    showError()
                }
            }


            override fun onReceivedSslError(
                view: WebView?,
                handler: SslErrorHandler?,
                error: android.net.http.SslError?
            ) {
                // Proceed with SSL errors (for development)
                handler?.proceed()
            }

            override fun shouldOverrideUrlLoading(
                view: WebView?,
                request: WebResourceRequest?
            ): Boolean {
                val url = request?.url?.toString() ?: return false
                
                // Keep these domains in WebView
                val allowedDomains = listOf(
                    "govexams.info",
                    "onrender.com",
                    "supabase.co",
                    "razorpay.com"
                )
                
                if (allowedDomains.any { url.contains(it) }) {
                    return false
                }
                
                // Open other URLs in external browser
                try {
                    startActivity(Intent(Intent.ACTION_VIEW, Uri.parse(url)))
                } catch (e: Exception) {
                    e.printStackTrace()
                }
                return true
            }
        }

        webView.webChromeClient = object : WebChromeClient() {
            override fun onProgressChanged(view: WebView?, newProgress: Int) {
                super.onProgressChanged(view, newProgress)
                progressBar.progress = newProgress
            }
        }

        webView.setDownloadListener { url, _, _, _, _ ->
            try {
                startActivity(Intent(Intent.ACTION_VIEW, Uri.parse(url)))
            } catch (e: Exception) {
                Toast.makeText(this, "Cannot open download", Toast.LENGTH_SHORT).show()
            }
        }
    }

    private fun showError() {
        progressBar.visibility = View.GONE
        swipeRefresh.isRefreshing = false
        errorView.visibility = View.VISIBLE
        webView.visibility = View.GONE
    }

    override fun onKeyDown(keyCode: Int, event: KeyEvent?): Boolean {
        if (keyCode == KeyEvent.KEYCODE_BACK && webView.canGoBack()) {
            webView.goBack()
            return true
        }
        return super.onKeyDown(keyCode, event)
    }

    override fun onResume() {
        super.onResume()
        webView.onResume()
    }

    override fun onPause() {
        super.onPause()
        webView.onPause()
    }

    override fun onDestroy() {
        webView.destroy()
        super.onDestroy()
    }
}
