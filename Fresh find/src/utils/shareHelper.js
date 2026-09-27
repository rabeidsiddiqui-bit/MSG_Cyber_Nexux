/**
 * FreshFind Sharing & Recommendation Helper
 * Uses navigator.share on supported mobile/desktop devices,
 * with graceful fallback to clipboard copy and direct WhatsApp link.
 */

export async function shareContent({ title, text, url }) {
  const shareUrl = url || window.location.href;
  const combinedText = text ? `${text}\n${shareUrl}` : shareUrl;

  // 1. Try native Web Share API
  if (typeof navigator !== 'undefined' && navigator.share) {
    try {
      await navigator.share({
        title: title || 'FreshFind Pakistan',
        text: text || 'Explore verified farmers markets & fresh produce on FreshFind Pakistan',
        url: shareUrl
      });
      return { success: true, method: 'native' };
    } catch (err) {
      if (err.name === 'AbortError') {
        return { success: false, method: 'canceled' };
      }
      // If error occurred (e.g. desktop permission), proceed to clipboard fallback
    }
  }

  // 2. Clipboard Fallback
  try {
    if (typeof navigator !== 'undefined' && navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(`${title ? title + ' - ' : ''}${combinedText}`);
      return { success: true, method: 'clipboard' };
    }
  } catch (clipErr) {
    console.warn('Clipboard write failed:', clipErr);
  }

  // 3. Fallback: Open WhatsApp share
  const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(
    `${title ? title + ': ' : ''}${combinedText}`
  )}`;
  window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  return { success: true, method: 'whatsapp' };
}
