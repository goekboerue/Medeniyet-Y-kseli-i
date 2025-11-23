
import React, { useState } from 'react';
import { Download, X, Loader2, Camera, Share2, Check, FileText, RefreshCw } from 'lucide-react';

interface SnapshotModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRetry: () => void;
  imageData: string | null;
  textSummary: string;
  isLoading: boolean;
}

export const SnapshotModal: React.FC<SnapshotModalProps> = ({ isOpen, onClose, onRetry, imageData, textSummary, isLoading }) => {
  const [shareSuccess, setShareSuccess] = useState<'image' | 'text' | null>(null);

  if (!isOpen) return null;

  const handleDownload = () => {
    if (!imageData) return;
    const link = document.createElement('a');
    link.href = imageData;
    link.download = `medeniyet-fotografi-${Date.now()}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleShareImage = async () => {
    if (!imageData) return;

    try {
      const res = await fetch(imageData);
      const blob = await res.blob();
      const file = new File([blob], "medeniyet.jpg", { type: "image/jpeg" });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: 'Medeniyet Yükselişi',
          text: textSummary,
          files: [file],
        });
      } else {
        await navigator.clipboard.write([
            new ClipboardItem({
                [blob.type]: blob
            })
        ]);
        setShareSuccess('image');
        setTimeout(() => setShareSuccess(null), 2000);
      }
    } catch (error) {
      console.error("Sharing failed", error);
    }
  };

  const handleShareText = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'Medeniyet Yükselişi',
          text: textSummary,
        });
      } else {
        await navigator.clipboard.writeText(textSummary);
        setShareSuccess('text');
        setTimeout(() => setShareSuccess(null), 2000);
      }
    } catch (e) {
      console.error("Text share failed", e);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose}></div>
      
      <div className="relative z-10 bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl max-w-4xl w-full overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-4 border-b border-gray-800 flex justify-between items-center bg-gray-900/50">
          <h2 className="text-xl font-cinzel font-bold text-white flex items-center gap-2">
            <Camera className="text-purple-400" /> Medeniyet Tablosu
          </h2>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-800 rounded-full text-gray-400 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 p-6 flex flex-col items-center justify-center bg-black/50 min-h-[300px] relative gap-4 overflow-y-auto">
          
          {isLoading ? (
            <div className="flex flex-col items-center text-center space-y-4 py-10">
              <div className="relative">
                <div className="absolute inset-0 bg-purple-500/20 blur-xl rounded-full animate-pulse"></div>
                <Loader2 size={48} className="text-purple-500 animate-spin relative z-10" />
              </div>
              <div>
                <p className="text-lg font-bold text-gray-200">Ressam Çalışıyor...</p>
                <p className="text-sm text-gray-500">İmparatorluğunun ihtişamı tuvale dökülüyor.</p>
              </div>
            </div>
          ) : imageData ? (
            <div className="relative group w-full flex flex-col items-center">
              <img 
                src={imageData} 
                alt="Civilization Snapshot" 
                className="max-h-[50vh] w-auto rounded-lg shadow-[0_0_30px_rgba(0,0,0,0.5)] border border-gray-800 mb-4"
              />
              <p className="text-white/60 text-xs font-mono text-center italic max-w-lg">
                 "{textSummary}"
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4 py-8">
                <div className="p-6 bg-red-900/20 border border-red-500/30 rounded-lg text-red-300 text-center max-w-md">
                   <p className="font-bold text-lg mb-2">Görüntü oluşturulamadı</p>
                   <p className="text-sm opacity-80 mb-4">
                     Yapay zeka modellerinde anlık yoğunluk yaşanıyor veya güvenlik filtresi devreye girdi. 
                   </p>
                   <button 
                     onClick={onRetry}
                     className="px-6 py-2 bg-red-800 hover:bg-red-700 text-white rounded shadow-lg flex items-center justify-center gap-2 mx-auto transition-colors"
                   >
                     <RefreshCw size={16} /> Tekrar Dene
                   </button>
                </div>
            </div>
          )}

        </div>

        {/* Footer */}
        {!isLoading && (
          <div className="p-4 border-t border-gray-800 bg-gray-900/50 flex flex-col md:flex-row justify-between items-center gap-3">
             
             <div className="flex gap-2 w-full md:w-auto order-2 md:order-1">
                <button 
                  onClick={handleShareText}
                  className={`flex-1 md:flex-none px-4 py-2 rounded-lg text-sm font-bold border transition-all flex items-center justify-center gap-2
                     ${shareSuccess === 'text'
                        ? 'bg-green-900/50 text-green-300 border-green-500/50'
                        : 'bg-gray-800 text-gray-300 border-gray-600 hover:bg-gray-700'
                     }`}
                >
                  {shareSuccess === 'text' ? <Check size={16} /> : <FileText size={16} />}
                  {shareSuccess === 'text' ? 'Kopyalandı' : 'Rapor Paylaş'}
                </button>
             </div>

            <div className="flex gap-2 w-full md:w-auto order-1 md:order-2">
                {imageData && (
                    <>
                        <button 
                        onClick={handleShareImage}
                        className={`flex-1 md:flex-none px-4 py-2 rounded-lg text-sm font-bold text-white shadow-lg transition-all flex items-center justify-center gap-2
                            ${shareSuccess === 'image' 
                                ? 'bg-green-600 hover:bg-green-500' 
                                : 'bg-blue-600 hover:bg-blue-500'
                            }`}
                        >
                        {shareSuccess === 'image' ? <Check size={16} /> : <Share2 size={16} />}
                        {shareSuccess === 'image' ? 'Kopyalandı!' : 'Resmi Paylaş'}
                        </button>

                        <button 
                        onClick={handleDownload}
                        className="flex-1 md:flex-none px-6 py-2 rounded-lg text-sm font-bold bg-amber-600 hover:bg-amber-500 text-white shadow-lg shadow-amber-900/20 transition-all flex items-center justify-center gap-2"
                        >
                        <Download size={16} />
                        İndir
                        </button>
                    </>
                )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
