import React, { useRef } from 'react';
import { X, Download, Printer, Award, ShieldCheck, Calendar, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';

export const CertificateModal = ({ certificate, onClose }) => {
  const certRef = useRef(null);

  if (!certificate) return null;

  const certNo = certificate.certificateNo || 'CC-CERT-2026-XXXX';
  const studentName = certificate.studentName || certificate.student?.user?.name || 'Honored Student';
  const branch = certificate.branch || certificate.student?.branch || 'Academic Department';
  const title = certificate.title || 'Certificate of Recognition';
  const description = certificate.description || 'For outstanding visual creativity and active participation in club events.';
  const issuedDate = certificate.issuedDate
    ? new Date(certificate.issuedDate).toLocaleDateString('en-US', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      })
    : new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' });

  // Download high-resolution PNG using HTML5 Canvas
  const handleDownloadImage = () => {
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = 1600;
      canvas.height = 1130; // Standard 1.414 landscape certificate ratio

      // Background gradient
      const bgGrad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      bgGrad.addColorStop(0, '#090d16');
      bgGrad.addColorStop(0.5, '#0f172a');
      bgGrad.addColorStop(1, '#050811');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Outer gold foil border
      ctx.strokeStyle = '#d97706';
      ctx.lineWidth = 14;
      ctx.strokeRect(36, 36, canvas.width - 72, canvas.height - 72);

      // Inner thin gold border
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 3;
      ctx.strokeRect(52, 52, canvas.width - 104, canvas.height - 104);

      // Corner ornaments
      ctx.fillStyle = '#f59e0b';
      const corners = [
        [52, 52],
        [canvas.width - 52, 52],
        [52, canvas.height - 52],
        [canvas.width - 52, canvas.height - 52]
      ];
      corners.forEach(([cx, cy]) => {
        ctx.beginPath();
        ctx.arc(cx, cy, 12, 0, Math.PI * 2);
        ctx.fill();
      });

      // Load official club logo into canvas
      const logoImg = new Image();
      logoImg.crossOrigin = 'anonymous';
      logoImg.onload = () => {
        // Draw circular logo at top center
        const logoSize = 110;
        const logoX = canvas.width / 2 - logoSize / 2;
        const logoY = 80;

        ctx.save();
        ctx.beginPath();
        ctx.arc(logoX + logoSize / 2, logoY + logoSize / 2, logoSize / 2, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(logoImg, logoX, logoY, logoSize, logoSize);
        ctx.restore();

        // Gold ring around logo
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(logoX + logoSize / 2, logoY + logoSize / 2, logoSize / 2 + 2, 0, Math.PI * 2);
        ctx.stroke();

        continueDrawingText();
      };

      logoImg.onerror = () => {
        if (logoImg.src.endsWith('/club-logo.jpeg')) {
          logoImg.src = '/club-logo.png';
        } else if (logoImg.src.endsWith('/club-logo.png')) {
          logoImg.src = '/club--logo.png';
        } else {
          continueDrawingText();
        }
      };

      logoImg.src = '/club-logo.jpeg';

      const continueDrawingText = () => {
        // Header Text: Institution & Club
        ctx.textAlign = 'center';
        ctx.fillStyle = '#f8fafc';
        ctx.font = 'bold 26px sans-serif';
        ctx.letterSpacing = '3px';
        ctx.fillText('KASHI GROUP OF INSTITUTIONS - VARANASI', canvas.width / 2, 225);

        ctx.fillStyle = '#fbbf24';
        ctx.font = 'bold 20px sans-serif';
        ctx.letterSpacing = '4px';
        ctx.fillText('CHITRAN PHOTOGRAPHY & CREATIVE SOCIETY', canvas.width / 2, 258);

        // Certificate Headline
        ctx.fillStyle = '#ffffff';
        ctx.font = '900 46px sans-serif';
        ctx.letterSpacing = '6px';
        ctx.fillText('CERTIFICATE OF RECOGNITION', canvas.width / 2, 335);

        // Subtitle
        ctx.fillStyle = '#94a3b8';
        ctx.font = 'italic 20px Georgia, serif';
        ctx.fillText('This official credential is proudly awarded to', canvas.width / 2, 385);

        // Recipient Student Name
        ctx.fillStyle = '#fbbf24';
        ctx.font = 'bold 54px Georgia, serif';
        ctx.fillText(studentName, canvas.width / 2, 460);

        // Gold underline under student name
        ctx.strokeStyle = '#d97706';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(canvas.width / 2 - 320, 480);
        ctx.lineTo(canvas.width / 2 + 320, 480);
        ctx.stroke();

        // Branch & Academic Department
        ctx.fillStyle = '#e2e8f0';
        ctx.font = 'bold 22px sans-serif';
        ctx.fillText(`Department of ${branch}`, canvas.width / 2, 525);

        // Title / Reason
        ctx.fillStyle = '#38bdf8';
        ctx.font = 'bold 26px sans-serif';
        ctx.fillText(`“${title}”`, canvas.width / 2, 585);

        // Description / Body
        ctx.fillStyle = '#cbd5e1';
        ctx.font = '19px sans-serif';
        ctx.fillText(description, canvas.width / 2, 635);

        // Serial and verification badge
        ctx.fillStyle = '#64748b';
        ctx.font = '15px monospace';
        ctx.fillText(`SERIAL VERIFICATION ID: ${certNo}`, canvas.width / 2, 700);

        // Signatures Section
        const sigY = 930;

        // Left Signature: Club Faculty Coordinator
        ctx.strokeStyle = '#475569';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(220, sigY);
        ctx.lineTo(500, sigY);
        ctx.stroke();

        ctx.fillStyle = '#f8fafc';
        ctx.font = 'bold 18px sans-serif';
        ctx.fillText('Prof. Priya Verma', 360, sigY + 28);
        ctx.fillStyle = '#94a3b8';
        ctx.font = '14px sans-serif';
        ctx.fillText('Faculty Club Coordinator', 360, sigY + 50);

        // Center: Date & Official Seal Text
        ctx.fillStyle = '#fbbf24';
        ctx.font = 'bold 16px sans-serif';
        ctx.fillText('★ OFFICIAL SEAL ★', canvas.width / 2, sigY + 10);
        ctx.fillStyle = '#94a3b8';
        ctx.font = '14px sans-serif';
        ctx.fillText(`Awarded: ${issuedDate}`, canvas.width / 2, sigY + 38);

        // Right Signature: Dean & Club Patron
        ctx.strokeStyle = '#475569';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(canvas.width - 500, sigY);
        ctx.lineTo(canvas.width - 220, sigY);
        ctx.stroke();

        ctx.fillStyle = '#f8fafc';
        ctx.font = 'bold 18px sans-serif';
        ctx.fillText('Dr. Rajesh Sharma', canvas.width - 360, sigY + 28);
        ctx.fillStyle = '#94a3b8';
        ctx.font = '14px sans-serif';
        ctx.fillText('Dean & Club Patron', canvas.width - 360, sigY + 50);

        // Convert canvas to download
        const url = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.download = `Certificate_${certNo}_${studentName.replace(/[^a-zA-Z0-9]/g, '_')}.png`;
        link.href = url;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success('Certificate downloaded successfully!');
      };
    } catch (err) {
      console.error('Download certificate error:', err);
      toast.error('Could not download certificate');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6">
      <div className="bg-stone-900 rounded-3xl max-w-4xl w-full overflow-hidden shadow-2xl border border-stone-800 animate-in fade-in zoom-in duration-200">
        {/* Top Control Bar */}
        <div className="px-6 py-4 border-b border-stone-800 flex items-center justify-between bg-stone-950">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-white text-sm sm:text-base">Official Club Certificate</h3>
              <p className="text-[11px] text-stone-400">Verifiable Credential • {certNo}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadImage}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
              title="Download as High-Res PNG"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download PNG</span>
            </button>
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white text-xs font-semibold border border-stone-700 transition-all cursor-pointer"
              title="Print Certificate"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-stone-400 hover:text-white rounded-lg hover:bg-stone-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Physical Certificate Delivery Banner (if physical) */}
        {(certificate.isPhysical || certificate.deliveryType === 'PHYSICAL') && (
          <div className="bg-amber-950/90 border-b border-amber-500/30 px-6 py-2.5 flex flex-wrap items-center justify-between gap-2 text-xs text-amber-200">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              <span className="font-bold">Physical Parchment Certificate:</span>
              <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 font-extrabold uppercase text-[10px] border border-amber-500/30">
                {certificate.physicalStatus?.replace(/_/g, ' ') || 'READY FOR COLLECTION'}
              </span>
            </div>
            {certificate.physicalRemarks && (
              <p className="text-[11px] text-amber-300/80 italic">
                {certificate.physicalRemarks}
              </p>
            )}
          </div>
        )}

        {/* Certificate Display Card */}
        <div className="p-4 sm:p-8 bg-black/60 overflow-x-auto flex justify-center">
          <div
            ref={certRef}
            className="w-full max-w-3xl aspect-[1.414/1] bg-gradient-to-br from-stone-950 via-stone-900 to-stone-950 rounded-2xl border-4 border-amber-600/60 p-6 sm:p-10 relative shadow-2xl flex flex-col justify-between select-none overflow-hidden"
            style={{
              boxShadow: '0 0 40px rgba(217, 119, 6, 0.15)'
            }}
          >
            {/* Inner Golden Border */}
            <div className="absolute inset-3 border border-amber-500/30 rounded-xl pointer-events-none" />

            {/* Corner Decorative Studs */}
            <div className="absolute top-4 left-4 w-3 h-3 rounded-full bg-amber-400/80 shadow-sm" />
            <div className="absolute top-4 right-4 w-3 h-3 rounded-full bg-amber-400/80 shadow-sm" />
            <div className="absolute bottom-4 left-4 w-3 h-3 rounded-full bg-amber-400/80 shadow-sm" />
            <div className="absolute bottom-4 right-4 w-3 h-3 rounded-full bg-amber-400/80 shadow-sm" />

            {/* Header: Institutional Seal & Names */}
            <div className="text-center relative z-10">
              <div className="flex justify-center mb-2">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white p-1 ring-4 ring-amber-500/40 shadow-xl overflow-hidden flex items-center justify-center">
                  <img
                    src="/club-logo.jpeg"
                    alt="Chitran Logo"
                    className="w-full h-full object-contain rounded-full"
                    onError={(e) => {
                      if (e.target.src.endsWith('/club-logo.jpeg')) {
                        e.target.src = '/club-logo.png';
                      } else if (e.target.src.endsWith('/club-logo.png')) {
                        e.target.src = '/club--logo.png';
                      } else {
                        e.target.onerror = null;
                      }
                    }}
                  />
                </div>
              </div>

              <h4 className="text-[10px] sm:text-xs font-bold text-stone-300 uppercase tracking-widest">
                Kashi Group of Institutions • Varanasi
              </h4>
              <h5 className="text-[11px] sm:text-sm font-black text-amber-400 uppercase tracking-wider mt-0.5 font-serif">
                Chitran Photography & Creative Society
              </h5>
              
              {/* Badge based on Certificate Attributes */}
              {certificate.isPhysical || certificate.deliveryType === 'PHYSICAL' ? (
                <div className="inline-flex flex-wrap items-center justify-center gap-1.5 mt-2.5 px-3.5 py-1 rounded-full bg-amber-500/20 border-2 border-amber-400/80 text-amber-300 font-black text-[10px] sm:text-xs uppercase tracking-wider shadow-lg">
                  <span>🏆 Official Physical Parchment Edition</span>
                  {certificate.rank && (
                    <span className="px-2 py-0.5 bg-amber-400 text-stone-950 rounded-full font-black text-[10px] tracking-normal">
                      Rank #{certificate.rank} Top Performer
                    </span>
                  )}
                </div>
              ) : (
                <div className="inline-flex items-center gap-1.5 mt-2.5 px-3.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-400/40 text-emerald-300 font-extrabold text-[10px] sm:text-xs uppercase tracking-wider">
                  <span>🎓 Verified E-Certificate • Workshop Attendance</span>
                </div>
              )}
            </div>

            {/* Body: Recipient & Award */}
            <div className="text-center my-3 relative z-10">
              <p className="text-xs sm:text-sm italic text-stone-400 font-serif">
                This certificate is proudly conferred upon
              </p>
              <h2 className="text-2xl sm:text-4xl font-black text-amber-400 tracking-tight font-serif mt-1">
                {studentName}
              </h2>
              <div className="w-36 h-0.5 bg-gradient-to-r from-transparent via-amber-500 to-transparent mx-auto mt-1 mb-2" />

              <p className="text-xs sm:text-sm font-semibold text-stone-200">
                Department of {branch}
              </p>

              <p className="text-sm sm:text-base font-bold text-amber-300 mt-2">
                “{title}”
              </p>

              <p className="text-[11px] sm:text-xs text-stone-400 max-w-xl mx-auto mt-1.5 leading-relaxed">
                {description}
              </p>
            </div>

            {/* Footer: Signatures, Seal & Date */}
            <div className="grid grid-cols-3 items-end pt-4 border-t border-stone-800 relative z-10 text-center">
              {/* Coordinator Signature */}
              <div className="text-left pl-2">
                <div className="w-28 sm:w-36 h-px bg-stone-600 mb-1" />
                <p className="text-[11px] sm:text-xs font-bold text-white">Prof. Priya Verma</p>
                <p className="text-[9px] sm:text-[10px] text-stone-400">Club Faculty Coordinator</p>
              </div>

              {/* Center Seal */}
              <div className="flex flex-col items-center justify-center">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 border-amber-500/50 bg-amber-500/10 flex items-center justify-center text-amber-400 mb-1">
                  <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <span className="text-[9px] sm:text-[10px] text-stone-400 font-mono">
                  {certNo}
                </span>
                <span className="text-[9px] sm:text-[10px] text-amber-400/90 font-medium">
                  {issuedDate}
                </span>
              </div>

              {/* Dean Signature */}
              <div className="text-right pr-2 flex flex-col items-end">
                <div className="w-28 sm:w-36 h-px bg-stone-600 mb-1" />
                <p className="text-[11px] sm:text-xs font-bold text-white">Dr. Rajesh Sharma</p>
                <p className="text-[9px] sm:text-[10px] text-stone-400">Dean & Club Patron</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CertificateModal;
