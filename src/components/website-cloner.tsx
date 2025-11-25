import React, { useState, useRef } from 'react';
import { Download, Copy, Upload, Loader2, AlertCircle, Eye, Sparkles, FileImage, Moon, Sun, Zap, Lock, CreditCard, Check, X } from 'lucide-react';

export default function AIWebsiteCloner() {
  const [loading, setLoading] = useState(false);
  const [generatedCode, setGeneratedCode] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [imagePreview, setImagePreview] = useState('');
  const [imageData, setImageData] = useState('');
  const [imageType, setImageType] = useState('');
  const [darkMode, setDarkMode] = useState(true);
  const [downloadAssets, setDownloadAssets] = useState(true);
  const fileInputRef = useRef(null);

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [clonesUsed, setClonesUsed] = useState(0);
  const [isPro, setIsPro] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const [showPricing, setShowPricing] = useState(false);

  const FREE_LIMIT = 5;

  const handleGoogleLogin = () => {
    setTimeout(() => {
      setUser({
        name: 'Demo User',
        email: 'demo@example.com',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Demo'
      });
      setIsLoggedIn(true);
    }, 1000);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUser(null);
    setClonesUsed(0);
    setIsPro(false);
    setGeneratedCode('');
    setImagePreview('');
  };

  const handleSubscribe = () => {
    setTimeout(() => {
      setIsPro(true);
      setShowPricing(false);
      setShowPaywall(false);
    }, 1500);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file');
      return;
    }

    setImageType(file.type);

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64String = event.target.result;
      setImagePreview(base64String);
      const base64Data = base64String.split(',')[1];
      setImageData(base64Data);
      setError('');
    };
    reader.onerror = () => {
      setError('Failed to read image file');
    };
    reader.readAsDataURL(file);
  };

  const analyzeAndClone = async () => {
    if (!isLoggedIn) {
      setError('Please log in to use the cloner');
      return;
    }

    if (!isPro && clonesUsed >= FREE_LIMIT) {
      setShowPaywall(true);
      return;
    }

    if (!imageData) {
      setError('Please upload a screenshot first');
      return;
    }

    setLoading(true);
    setError('');
    setGeneratedCode('');

    try {
      const mediaType = imageType || 'image/jpeg';
      
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 4096,
          messages: [
            {
              role: "user",
              content: [
                {
                  type: "image",
                  source: {
                    type: "base64",
                    media_type: mediaType,
                    data: imageData,
                  }
                },
                {
                  type: "text",
                  text: `You are an expert web developer. Analyze this website screenshot and recreate it as a complete, functional HTML page with inline CSS.

IMPORTANT REQUIREMENTS:
1. Create a COMPLETE, SELF-CONTAINED HTML file with all CSS inline in a style tag
2. Recreate the visual design as accurately as possible
3. Use modern CSS for layouts
4. Make it fully responsive
5. ${downloadAssets ? 'Embed images as inline base64 or SVG' : 'Use placeholder images'}
6. Include ALL visible sections
7. Match colors and styling closely
8. Add hover effects
9. Use semantic HTML5
10. Make buttons functional

CRITICAL: Your ENTIRE response must be ONLY the HTML code. Start with DOCTYPE html and end with html tag. No explanations or markdown.`
                }
              ]
            }
          ]
        })
      });

      if (!response.ok) {
        throw new Error('API request failed');
      }

      const data = await response.json();
      
      if (!data.content || !data.content[0] || !data.content[0].text) {
        throw new Error('Invalid response format');
      }
      
      let htmlCode = data.content[0].text;
      htmlCode = htmlCode.replace(/```html\n?/g, '').replace(/```\n?/g, '').trim();
      
      if (!htmlCode.toLowerCase().startsWith('<!doctype')) {
        htmlCode = '<!DOCTYPE html>\n' + htmlCode;
      }
      
      setGeneratedCode(htmlCode);
      
      if (!isPro) {
        setClonesUsed(prev => prev + 1);
      }
    } catch (err) {
      setError('Failed to generate website. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const downloadHTML = () => {
    const blob = new Blob([generatedCode], { type: 'text/html' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ai-cloned-website.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generatedCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy');
    }
  };

  if (!isLoggedIn) {
    return (
      <div className={`min-h-screen ${darkMode ? 'bg-black text-white' : 'bg-gray-50 text-black'}`}>
        <div className="flex items-center justify-center min-h-screen p-6">
          <div className={`max-w-md w-full border-4 p-8 ${darkMode ? 'border-gray-800 bg-gray-900' : 'border-gray-300 bg-white'}`}>
            <div className="text-center mb-8">
              <Zap className={`w-12 h-12 mx-auto mb-4 ${darkMode ? 'text-lime-400' : 'text-black'}`} strokeWidth={3} />
              <h1 className={`text-4xl font-black ${darkMode ? 'text-white' : 'text-black'}`}>CLONE/AI</h1>
              <p className={`text-lg font-bold mt-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Sign in to start cloning
              </p>
            </div>

            <button
              onClick={handleGoogleLogin}
              className={`w-full py-4 border-4 font-black flex items-center justify-center gap-3 transition-all hover:scale-99 ${
                darkMode ? 'border-lime-400 bg-lime-400 text-black hover:bg-black hover:text-lime-400' : 'border-black bg-black text-white hover:bg-white hover:text-black'
              }`}
            >
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              </svg>
              CONTINUE WITH GOOGLE
            </button>

            <div className={`mt-6 p-4 border-4 ${darkMode ? 'border-gray-800 bg-black' : 'border-gray-300 bg-gray-50'}`}>
              <p className={`text-sm font-bold ${darkMode ? 'text-gray-500' : 'text-gray-600'}`}>
                Get 5 free clones - Upgrade for unlimited
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (showPricing) {
    return (
      <div className={`min-h-screen ${darkMode ? 'bg-black text-white' : 'bg-gray-50 text-black'}`}>
        <div className="max-w-6xl mx-auto px-6 py-12">
          <button
            onClick={() => setShowPricing(false)}
            className={`mb-8 p-3 border-4 font-black ${darkMode ? 'border-gray-700 hover:border-lime-400' : 'border-gray-400 hover:border-black'}`}
          >
            <X className="w-6 h-6" strokeWidth={3} />
          </button>

          <div className="text-center mb-12">
            <h2 className="text-6xl font-black mb-4">CHOOSE YOUR PLAN</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className={`border-4 p-8 ${darkMode ? 'border-gray-800 bg-gray-900' : 'border-gray-300 bg-white'}`}>
              <h3 className="text-3xl font-black mb-2">FREE</h3>
              <div className="text-5xl font-black mb-6">$0</div>
              <button disabled className={`w-full py-4 border-4 font-black opacity-50 ${darkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-400 bg-gray-200'}`}>
                CURRENT PLAN
              </button>
            </div>

            <div className={`border-4 p-8 relative ${darkMode ? 'border-lime-400 bg-gray-900' : 'border-black bg-white'}`}>
              <div className={`absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 border-4 font-black text-sm ${darkMode ? 'border-lime-400 bg-lime-400 text-black' : 'border-black bg-black text-white'}`}>
                POPULAR
              </div>
              <h3 className="text-3xl font-black mb-2">PRO</h3>
              <div className="text-5xl font-black mb-6">$19<span className="text-2xl">/mo</span></div>
              <button
                onClick={handleSubscribe}
                className={`w-full py-4 border-4 font-black transition-all hover:scale-99 ${darkMode ? 'border-lime-400 bg-lime-400 text-black hover:bg-black hover:text-lime-400' : 'border-black bg-black text-white hover:bg-white hover:text-black'}`}
              >
                SUBSCRIBE NOW
              </button>
            </div>

            <div className={`border-4 p-8 ${darkMode ? 'border-gray-800 bg-gray-900' : 'border-gray-300 bg-white'}`}>
              <h3 className="text-3xl font-black mb-2">ENTERPRISE</h3>
              <div className="text-5xl font-black mb-6">$99<span className="text-2xl">/mo</span></div>
              <button className={`w-full py-4 border-4 font-black ${darkMode ? 'border-gray-700 bg-gray-800 hover:border-lime-400' : 'border-gray-400 bg-gray-200 hover:border-black'}`}>
                CONTACT SALES
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (showPaywall) {
    return (
      <div className={`min-h-screen ${darkMode ? 'bg-black text-white' : 'bg-gray-50 text-black'}`}>
        <div className="flex items-center justify-center min-h-screen p-6">
          <div className={`max-w-lg w-full border-4 p-8 ${darkMode ? 'border-gray-800 bg-gray-900' : 'border-gray-300 bg-white'}`}>
            <div className="text-center mb-8">
              <Lock className={`w-16 h-16 mx-auto mb-4 ${darkMode ? 'text-lime-400' : 'text-black'}`} strokeWidth={3} />
              <h2 className="text-4xl font-black mb-4">FREE LIMIT REACHED</h2>
              <p className={`text-lg font-bold ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                You have used all {FREE_LIMIT} free clones
              </p>
            </div>

            <button
              onClick={() => setShowPricing(true)}
              className={`w-full py-4 border-4 font-black mb-4 transition-all hover:scale-99 ${darkMode ? 'border-lime-400 bg-lime-400 text-black hover:bg-black hover:text-lime-400' : 'border-black bg-black text-white hover:bg-white hover:text-black'}`}
            >
              <span className="flex items-center justify-center gap-2">
                <CreditCard className="w-6 h-6" strokeWidth={3} />
                VIEW PRICING
              </span>
            </button>

            <button
              onClick={() => setShowPaywall(false)}
              className={`w-full py-3 border-4 font-black ${darkMode ? 'border-gray-700 hover:border-lime-400' : 'border-gray-400 hover:border-black'}`}
            >
              GO BACK
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-black text-white' : 'bg-gray-50 text-black'}`}>
      <div className={`border-b-4 ${darkMode ? 'border-lime-400' : 'border-black'}`}>
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="flex justify-between items-start mb-8">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Zap className={`w-10 h-10 ${darkMode ? 'text-lime-400' : 'text-black'}`} strokeWidth={3} />
                <h1 className={`text-5xl font-black ${darkMode ? 'text-white' : 'text-black'}`}>CLONE/AI</h1>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              {!isPro && (
                <div className={`px-4 py-2 border-4 font-black ${darkMode ? 'border-gray-800 bg-gray-900' : 'border-gray-300 bg-white'}`}>
                  {clonesUsed}/{FREE_LIMIT} FREE
                </div>
              )}
              
              {isPro && (
                <div className={`px-4 py-2 border-4 font-black ${darkMode ? 'border-lime-400 bg-lime-400 text-black' : 'border-black bg-black text-white'}`}>
                  PRO
                </div>
              )}

              <button
                onClick={() => setDarkMode(!darkMode)}
                className={`p-3 border-4 ${darkMode ? 'border-lime-400 bg-lime-400 text-black hover:bg-black hover:text-lime-400' : 'border-black bg-black text-white hover:bg-white hover:text-black'}`}
              >
                {darkMode ? <Sun className="w-6 h-6" strokeWidth={3} /> : <Moon className="w-6 h-6" strokeWidth={3} />}
              </button>

              <button
                onClick={handleLogout}
                className={`px-4 py-3 border-4 font-black ${darkMode ? 'border-gray-700 hover:border-lime-400' : 'border-gray-400 hover:border-black'}`}
              >
                LOGOUT
              </button>
            </div>
          </div>

          <h2 className={`text-6xl font-black mb-4 ${darkMode ? 'text-white' : 'text-black'}`}>
            SCREENSHOT. ANALYZE. <span className={darkMode ? 'text-lime-400' : 'text-black'}>RECREATE.</span>
          </h2>

          {!isPro && (
            <button
              onClick={() => setShowPricing(true)}
              className={`mt-4 px-6 py-3 border-4 font-black ${darkMode ? 'border-lime-400 text-lime-400 hover:bg-lime-400 hover:text-black' : 'border-black hover:bg-black hover:text-white'}`}
            >
              UPGRADE TO PRO
            </button>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className={`border-4 p-8 mb-8 ${darkMode ? 'border-gray-800 bg-gray-900' : 'border-gray-300 bg-white'}`}>
          <h3 className="text-3xl font-black mb-6">UPLOAD SCREENSHOT</h3>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />

          {!imagePreview ? (
            <button
              onClick={() => fileInputRef.current?.click()}
              className={`w-full h-64 border-4 border-dashed ${darkMode ? 'border-gray-700 hover:border-lime-400 bg-black' : 'border-gray-400 hover:border-black bg-gray-50'}`}
            >
              <Upload className={`w-16 h-16 mx-auto mb-4 ${darkMode ? 'text-gray-700' : 'text-gray-400'}`} strokeWidth={3} />
              <p className="text-2xl font-black">DROP FILE HERE</p>
            </button>
          ) : (
            <div className="space-y-4">
              <div className="relative">
                <img src={imagePreview} alt="Screenshot" className={`w-full border-4 ${darkMode ? 'border-gray-800' : 'border-gray-300'}`} />
                <button
                  onClick={() => {
                    setImagePreview('');
                    setImageData('');
                    setGeneratedCode('');
                  }}
                  className={`absolute top-4 right-4 px-4 py-2 border-4 font-black ${darkMode ? 'border-red-500 bg-red-500 text-white hover:bg-black hover:text-red-500' : 'border-black bg-black text-white hover:bg-white hover:text-black'}`}
                >
                  REMOVE
                </button>
              </div>

              <div className={`p-4 border-4 ${darkMode ? 'border-gray-800 bg-gray-900' : 'border-gray-300 bg-white'}`}>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={downloadAssets}
                    onChange={(e) => setDownloadAssets(e.target.checked)}
                    className="w-6 h-6"
                  />
                  <span className="font-black">CLONE ASSETS</span>
                </label>
              </div>

              <button
                onClick={analyzeAndClone}
                disabled={loading}
                className={`w-full py-6 border-4 font-black text-2xl ${darkMode ? 'border-lime-400 bg-lime-400 text-black hover:bg-black hover:text-lime-400' : 'border-black bg-black text-white hover:bg-white hover:text-black'} disabled:opacity-50`}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-3">
                    <Loader2 className="w-8 h-8 animate-spin" strokeWidth={3} />
                    ANALYZING...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-3">
                    <Eye className="w-8 h-8" strokeWidth={3} />
                    CLONE WITH AI
                  </span>
                )}
              </button>
            </div>
          )}

          {error && (
            <div className={`mt-4 p-4 border-4 ${darkMode ? 'border-red-500 bg-red-950' : 'border-red-500 bg-red-50'}`}>
              <p className="font-bold">{error}</p>
            </div>
          )}
        </div>

        {generatedCode && (
          <div className="space-y-8">
            <div className="flex gap-4">
              <button
                onClick={copyToClipboard}
                className={`flex-1 py-4 border-4 font-black ${darkMode ? 'border-gray-700 bg-gray-800 hover:border-lime-400' : 'border-gray-400 bg-gray-200 hover:border-black'}`}
              >
                <Copy className="w-5 h-5 inline mr-2" strokeWidth={3} />
                {copied ? 'COPIED!' : 'COPY CODE'}
              </button>
              <button
                onClick={downloadHTML}
                className={`flex-1 py-4 border-4 font-black ${darkMode ? 'border-lime-400 bg-lime-400 text-black hover:bg-black hover:text-lime-400' : 'border-black bg-black text-white hover:bg-white hover:text-black'}`}
              >
                <Download className="w-5 h-5 inline mr-2" strokeWidth={3} />
                DOWNLOAD HTML
              </button>
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
              <div className={`border-4 p-6 ${darkMode ? 'border-gray-800 bg-gray-900' : 'border-gray-300 bg-white'}`}>
                <h3 className="text-2xl font-black mb-4">ORIGINAL</h3>
                <img src={imagePreview} alt="Original" className="w-full" />
              </div>

              <div className={`border-4 p-6 ${darkMode ? 'border-gray-800 bg-gray-900' : 'border-gray-300 bg-white'}`}>
                <h3 className="text-2xl font-black mb-4">AI RECREATION</h3>
                <iframe
                  srcDoc={generatedCode}
                  className="w-full h-96 bg-white"
                  title="AI Generated"
                  sandbox="allow-same-origin allow-scripts"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}