import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Upload, Play, RefreshCw, CheckCircle, Sparkles, Share2, Link, Copy } from 'lucide-react';

const App = () => {
  // --- State ---
  const [image, setImage] = useState(null);
  const [aspectRatio, setAspectRatio] = useState(1);
  const [gridSize, setGridSize] = useState(4);
  const [pieces, setPieces] = useState([]);
  const [gameState, setGameState] = useState('setup'); // 'setup', 'animating', 'playing', 'won'
  
  const [draggingGroupId, setDraggingGroupId] = useState(null);
  const [dragStartPos, setDragStartPos] = useState({ x: 0, y: 0 });
  const [dragCurrentPos, setDragCurrentPos] = useState({ x: 0, y: 0 });
  
  // --- Share State ---
  const [isUploading, setIsUploading] = useState(false);
  const [shareUrl, setShareUrl] = useState(null);

  const containerRef = useRef(null);
  const fileInputRef = useRef(null);
  
  // HAAL DIT UIT ENVIRONMENT VARIABLES (Stel in op Vercel + .env.local)
  // Voorbeeld: https://[store-id].public.blob.vercel-storage.com/
  const BLOB_BASE_URL = import.meta.env.VITE_BLOB_BASE_URL || ''; 

  // --- URL Parser & Initialisatie ---
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const imgParam = params.get('img');
    const sizeParam = params.get('size');

    if (imgParam) {
      // Als BLOB_BASE_URL is ingesteld en imgParam is geen volledige URL, plak ze aan elkaar
      const fullUrl = (imgParam.startsWith('http') || !BLOB_BASE_URL) 
        ? imgParam 
        : `${BLOB_BASE_URL}${imgParam}`;

      // Preload image
      const img = new Image();
      img.onload = () => {
        setAspectRatio(img.width / img.height);
        
        // Teken op canvas om DataURL te krijgen (consistentie met upload flow)
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        
        setImage(canvas.toDataURL('image/jpeg', 0.85));
        
        // AUTO START als we vanuit een link komen
        if (sizeParam) setGridSize(parseInt(sizeParam, 10));
        
        // Kleine vertraging om state te laten settelen, dan starten
        setTimeout(() => {
          startGameFromLink(parseInt(sizeParam, 10) || 4); 
        }, 100);
      };
      img.crossOrigin = "Anonymous"; // Nodig voor canvas manipulatie van externe afbeeldingen
      img.src = fullUrl;
    }
  }, []);

  // Aparte startfunctie die direct de parameters accepteert (omdat state updates async zijn)
  const startGameFromLink = (size) => {
    // We kunnen hier niet direct `startGame` aanroepen omdat `pieces` state logic daarop vertrouwt
    // We simuleren een klik op start, maar passen de state logic aan voor directe start
    setGridSize(size);
    // Trigger start logic (kopie van startGame, maar roept direct animating aan)
    // Omdat startGame state afhankelijk is, kunnen we beter een flag zetten of useEffect gebruiken?
    // Beter: We breiden startGame uit of roepen hem aan via een ref/effect. 
    // Eenvoudigste fix voor nu: We zetten een 'wacht op start' state.
    setGameState('ready_to_start');
  };

  // Effect om daadwerkelijk te starten als alles ingeladen is
  useEffect(() => {
    if (gameState === 'ready_to_start' && image) {
      startGame();
    }
  }, [gameState, image]);


  // --- Confetti Effect ---
  const confettiParticles = useMemo(() => {
    if (gameState !== 'won') return [];
    return Array.from({ length: 60 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      delay: Math.random() * 3,
      duration: 2.5 + Math.random() * 2,
      color: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#EC4899'][Math.floor(Math.random() * 5)],
      left: Math.random() * 100
    }));
  }, [gameState]);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      processImage(file);
    }
  };

  const processImage = (file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const MAX_SIZE = 1200;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_SIZE) {
              height *= MAX_SIZE / width;
              width = MAX_SIZE;
            }
          } else {
            if (height > MAX_SIZE) {
              width *= MAX_SIZE / height;
              height = MAX_SIZE;
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);

          setAspectRatio(width / height);
          setImage(canvas.toDataURL('image/jpeg', 0.85));
          setShareUrl(null); // Reset share URL bij nieuwe afbeelding
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
  };

  const handleShare = async () => {
    if (!image) return;
    setIsUploading(true);

    try {
      // Convert DataURL to Blob
      const res = await fetch(image);
      const blob = await res.blob();

      // Upload to API (Raw Body for Node.js stream)
      // Filename wordt nu door de backend gegenereerd voor security
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: blob,
      });

      if (!response.ok) throw new Error('Upload failed');

      const data = await response.json();
      
      // Construct Share URL
      // We gebruiken alleen de bestandsnaam als BLOB_BASE_URL is ingesteld
      const fileUrl = data.url;
      const filename = fileUrl.split('/').pop(); // Haal bestandsnaam uit URL
      
      const url = new URL(window.location.href);
      
      if (BLOB_BASE_URL) {
        url.searchParams.set('img', filename);
      } else {
        url.searchParams.set('img', fileUrl); // Fallback: volledige URL
      }
      
      url.searchParams.set('size', gridSize);
      
      setShareUrl(url.toString());
    } catch (error) {
      console.error('Share failed:', error);
      alert('Er ging iets mis bij het delen. Probeer het later opnieuw.');
    } finally {
      setIsUploading(false);
    }
  };

  const copyToClipboard = () => {
    if (shareUrl) {
      navigator.clipboard.writeText(shareUrl);
      alert('Link gekopieerd!');
    }
  };

  /**
   * Herbereken alle groepen (Flood Fill) om integriteit te waarborgen.
   * Dit lost het probleem op van stukjes die per ongeluk in een groep blijven zitten.
   */
  const recalculateGroups = (currentPieces, triggerPulse = false) => {
    const next = currentPieces.map(p => ({ ...p, visited: false }));
    const now = Date.now();
    let groupCounter = 0;

    const oldGroupSizes = {};
    currentPieces.forEach(p => {
      oldGroupSizes[p.groupId] = (oldGroupSizes[p.groupId] || 0) + 1;
    });

    for (let i = 0; i < next.length; i++) {
      if (next[i].visited) continue;

      const newGroupId = `group-v3-${groupCounter++}`;
      const queue = [next[i]];
      const cluster = [];
      next[i].visited = true;

      while (queue.length > 0) {
        const p = queue.shift();
        cluster.push(p);
        p.groupId = newGroupId;

        // Check buren op correcte aansluiting
        const neighbors = next.filter(other => {
          if (other.visited) return false;
          const isPhysicallyAdj = (Math.abs(p.currentX - other.currentX) === 1 && p.currentY === other.currentY) ||
                                 (Math.abs(p.currentY - other.currentY) === 1 && p.currentX === other.currentX);
          if (!isPhysicallyAdj) return false;

          const dx = p.correctX - other.correctX;
          const dy = p.correctY - other.correctY;
          const curDx = p.currentX - other.currentX;
          const curDy = p.currentY - other.currentY;
          return dx === curDx && dy === curDy;
        });

        neighbors.forEach(n => {
          n.visited = true;
          queue.push(n);
        });
      }

      if (triggerPulse) {
        const originalGroupIds = new Set(cluster.map(p => {
          const original = currentPieces.find(orig => orig.id === p.id);
          return original ? original.groupId : null;
        }));
        
        const maxOldSize = Math.max(...Array.from(originalGroupIds).map(id => oldGroupSizes[id] || 0));
        if (cluster.length > maxOldSize && cluster.length > 1) {
          cluster.forEach(p => p.lastSnap = now);
        }
      }
    }

    return next.map(({ visited, ...p }) => p);
  };

  const startGame = () => {
    const size = gridSize;
    const mid = (size - 1) / 2;
    let basePieces = [];
    
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        basePieces.push({
          id: y * size + x,
          correctX: x,
          correctY: y,
          currentX: mid,
          currentY: mid,
          prevX: mid,
          prevY: mid,
          groupId: `temp-${y * size + x}`,
          lastSnap: 0,
          delay: 0
        });
      }
    }

    setPieces(basePieces);
    setGameState('animating');

    const positions = basePieces.map((_, i) => ({ x: i % size, y: Math.floor(i / size) }));
    for (let i = positions.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [positions[i], positions[j]] = [positions[j], positions[i]];
    }

    setTimeout(() => {
      setPieces(prev => prev.map((p, i) => ({
        ...p,
        currentX: positions[i].x,
        currentY: positions[i].y,
        prevX: positions[i].x,
        prevY: positions[i].y,
        delay: i * 20 
      })));
      
      const totalAnimTime = (size * size * 20) + 600;
      setTimeout(() => {
        setGameState('playing');
        setPieces(prev => recalculateGroups(prev.map(p => ({ ...p, delay: 0 })), false));
      }, totalAnimTime);
    }, 100);
  };

  const handleDragStart = (e, piece) => {
    if (gameState !== 'playing') return;
    const clientX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
    const clientY = e.type.includes('touch') ? e.touches[0].clientY : e.clientY;
    const rect = containerRef.current.getBoundingClientRect();
    
    setDragStartPos({ x: clientX - rect.left, y: clientY - rect.top });
    setDragCurrentPos({ x: clientX - rect.left, y: clientY - rect.top });
    setDraggingGroupId(piece.groupId);
    setPieces(prev => prev.map(p => ({ ...p, prevX: p.currentX, prevY: p.currentY })));
  };

  const handleDragMove = (e) => {
    if (!draggingGroupId) return;
    const clientX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
    const clientY = e.type.includes('touch') ? e.touches[0].clientY : e.clientY;
    const rect = containerRef.current.getBoundingClientRect();
    setDragCurrentPos({ x: clientX - rect.left, y: clientY - rect.top });
  };

  const handleDragEnd = () => {
    if (!draggingGroupId) return;
    const rect = containerRef.current.getBoundingClientRect();
    const cellW = rect.width / gridSize;
    const cellH = rect.height / gridSize;

    const deltaX = Math.round((dragCurrentPos.x - dragStartPos.x) / cellW);
    const deltaY = Math.round((dragCurrentPos.y - dragStartPos.y) / cellH);

    const draggingPieces = pieces.filter(p => p.groupId === draggingGroupId);
    const inBounds = draggingPieces.every(p => {
      const nx = p.prevX + deltaX;
      const ny = p.prevY + deltaY;
      return nx >= 0 && nx < gridSize && ny >= 0 && ny < gridSize;
    });

    if (!inBounds || (deltaX === 0 && deltaY === 0)) {
      setPieces(prev => prev.map(p => ({ ...p, currentX: p.prevX, currentY: p.prevY })));
      setDraggingGroupId(null);
      return;
    }

    const targetCoords = draggingPieces.map(p => ({ x: p.prevX + deltaX, y: p.prevY + deltaY }));
    const displacedPieces = pieces.filter(p => p.groupId !== draggingGroupId && targetCoords.some(tc => tc.x === p.currentX && tc.y === p.currentY));
    const sourceCoords = draggingPieces.map(p => ({ x: p.prevX, y: p.prevY })).filter(sc => !targetCoords.some(tc => tc.x === sc.x && tc.y === sc.y));

    displacedPieces.sort((a, b) => (a.currentY * gridSize + a.currentX) - (b.currentY * gridSize + b.currentX));
    sourceCoords.sort((a, b) => (a.y * gridSize + a.x) - (b.x * gridSize + b.x));

    let nextPieces = pieces.map(p => {
      if (p.groupId === draggingGroupId) {
        return { ...p, currentX: p.prevX + deltaX, prevX: p.prevX + deltaX, currentY: p.prevY + deltaY, prevY: p.prevY + deltaY };
      }
      const displaceIdx = displacedPieces.findIndex(dp => dp.id === p.id);
      if (displaceIdx !== -1) {
        const coord = sourceCoords[displaceIdx];
        return { 
          ...p, 
          currentX: coord.x, prevX: coord.x, 
          currentY: coord.y, prevY: coord.y,
          groupId: `temp-displace-${p.id}` 
        };
      }
      return p;
    });

    const finalState = recalculateGroups(nextPieces, true);
    setPieces(finalState);
    setDraggingGroupId(null);

    if (finalState.every(p => p.currentX === p.correctX && p.currentY === p.correctY)) setGameState('won');
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-white font-sans flex flex-col items-center select-none overflow-hidden touch-none relative">
      <style>{`
        @keyframes snapPulse {
          0% { transform: scale(1); filter: brightness(1); }
          50% { transform: scale(1.03); filter: brightness(1.6); }
          100% { transform: scale(1); filter: brightness(1); }
        }
        .snap-anim { animation: snapPulse 0.4s ease-out; z-index: 40 !important; }
        
        @keyframes glimmer {
          0% { transform: translateX(-150%) skewX(-25deg); }
          100% { transform: translateX(250%) skewX(-25deg); }
        }
        .glimmer-layer {
          position: absolute; inset: 0; pointer-events: none; overflow: hidden; z-index: 150;
        }
        .glimmer-bar {
          position: absolute; top: 0; left: 0; width: 45%; height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.35), transparent);
          animation: glimmer 1.5s ease-in-out forwards;
        }

        @keyframes confettiFall {
          0% { transform: translateY(-10vh) rotate(0deg); opacity: 1; }
          100% { transform: translateY(110vh) rotate(720deg); opacity: 0; }
        }
        .confetti {
          position: fixed; top: -5%; width: 10px; height: 10px; z-index: 200;
          animation: confettiFall linear infinite;
        }
      `}</style>

      {gameState === 'won' && confettiParticles.map(p => (
        <div key={p.id} className="confetti" style={{ 
          left: `${p.left}%`, 
          backgroundColor: p.color, 
          animationDuration: `${p.duration}s`, 
          animationDelay: `${p.delay}s` 
        }} />
      ))}

      {gameState === 'setup' ? (
        <div className="flex-1 flex flex-col items-center justify-center p-6 w-full max-w-md animate-in fade-in duration-500">
          <div className="mb-12 flex flex-col items-center">
             <Sparkles className="text-blue-500 mb-2" size={32} />
             <h1 className="text-lg font-black tracking-[0.3em] text-neutral-500 uppercase">Foto Puzzel</h1>
          </div>
          
          <div 
            onClick={() => fileInputRef.current.click()}
            className="w-full aspect-video rounded-[3rem] bg-neutral-900 border-4 border-neutral-800 flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 transition-all overflow-hidden relative group"
          >
            {image ? <img src={image} className="w-full h-full object-cover opacity-40" /> : <Upload className="text-neutral-800" size={48} />}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <span className="bg-white text-black px-6 py-3 rounded-full font-black text-[10px] tracking-widest shadow-2xl uppercase">Uploaden</span>
            </div>
            <input type="file" ref={fileInputRef} onChange={handleImageUpload} className="hidden" accept="image/*" />
          </div>

          <div className="mt-12 w-full">
            <p className="text-center text-[10px] text-neutral-600 font-bold tracking-widest uppercase mb-4">Grid Grootte</p>
            <div className="grid grid-cols-3 gap-3">
              {[3, 4, 5, 6, 7, 8].map(s => (
                <button 
                  key={s} onClick={() => setGridSize(s)}
                  className={`py-4 rounded-2xl font-black text-sm transition-all ${gridSize === s ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30 scale-105' : 'bg-neutral-900 text-neutral-600'}`}
                >
                  {s}x{s}
                </button>
              ))}
            </div>
          </div>

          <div className="w-full mt-10 space-y-4">
            <button 
              disabled={!image} onClick={startGame}
              className={`w-full py-6 rounded-[2.5rem] font-black text-xl transition-all ${image ? 'bg-white text-black active:scale-95 shadow-2xl shadow-white/20' : 'bg-neutral-900 text-neutral-800'}`}
            >
              START SPEL
            </button>

            {image && !shareUrl && (
              <button 
                onClick={handleShare}
                disabled={isUploading}
                className="w-full py-4 rounded-[2.5rem] font-bold text-sm bg-neutral-900 text-neutral-400 hover:text-white hover:bg-neutral-800 transition-all flex items-center justify-center gap-2"
              >
                {isUploading ? (
                  <RefreshCw className="animate-spin" size={16} />
                ) : (
                  <Share2 size={16} />
                )}
                MAAK DEELBARE LINK
              </button>
            )}

            {shareUrl && (
              <div className="w-full p-4 bg-neutral-900 rounded-3xl border border-neutral-800 animate-in slide-in-from-top-2">
                <p className="text-center text-[10px] text-neutral-500 font-bold uppercase mb-2">Jouw Unieke Link</p>
                <div 
                  onClick={copyToClipboard}
                  className="flex items-center gap-3 bg-black p-3 rounded-xl cursor-pointer hover:bg-neutral-950 transition-colors group"
                >
                  <Link size={16} className="text-blue-500 shrink-0" />
                  <span className="text-xs text-neutral-300 truncate font-mono">{shareUrl}</span>
                  <Copy size={16} className="text-neutral-600 group-hover:text-white ml-auto shrink-0" />
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="flex-1 w-full flex flex-col items-center justify-center p-4">
          <div 
            style={{ width: 'min(94vw, 78vh * ' + aspectRatio + ')', aspectRatio }}
            className="relative shadow-[0_60px_150px_rgba(0,0,0,0.95)] bg-black border-[10px] border-neutral-900 rounded-lg overflow-visible"
          >
            <div 
              ref={containerRef} className="relative w-full h-full"
              onMouseMove={handleDragMove} onMouseUp={handleDragEnd} onMouseLeave={handleDragEnd}
              onTouchMove={handleDragMove} onTouchEnd={handleDragEnd}
            >
              {pieces.map((p) => {
                const isDragging = draggingGroupId === p.groupId;
                const cellW = 100 / gridSize;
                const cellH = 100 / gridSize;
                let l = p.currentX * cellW;
                let t = p.currentY * cellH;

                if (isDragging && containerRef.current) {
                  const rect = containerRef.current.getBoundingClientRect();
                  l = p.prevX * cellW + (dragCurrentPos.x - dragStartPos.x) / rect.width * 100;
                  t = p.prevY * cellH + (dragCurrentPos.y - dragStartPos.y) / rect.height * 100;
                }

                const hasR = pieces.some(o => o.groupId === p.groupId && o.currentX === p.currentX + 1 && o.currentY === p.currentY);
                const hasL = pieces.some(o => o.groupId === p.groupId && o.currentX === p.currentX - 1 && o.currentY === p.currentY);
                const hasB = pieces.some(o => o.groupId === p.groupId && o.currentX === p.currentX && o.currentY === p.currentY + 1);
                const hasT = pieces.some(o => o.groupId === p.groupId && o.currentX === p.currentX && o.currentY === p.currentY - 1);
                const snapping = (Date.now() - p.lastSnap) < 450;

                const shadowList = [];
                const outlineColor = 'rgba(0,0,0,0.7)';
                const lw = '1.5px'; // line width
                const dw = '1px'; // diagonal offset for corners
                if (!hasT) shadowList.push(`0 -${lw} 0 0 ${outlineColor}`);
                if (!hasR) shadowList.push(`${lw} 0 0 0 ${outlineColor}`);
                if (!hasB) shadowList.push(`0 ${lw} 0 0 ${outlineColor}`);
                if (!hasL) shadowList.push(`-${lw} 0 0 0 ${outlineColor}`);
                if (!hasT && !hasR) shadowList.push(`${dw} -${dw} 0 0 ${outlineColor}`);
                if (!hasT && !hasL) shadowList.push(`-${dw} -${dw} 0 0 ${outlineColor}`);
                if (!hasB && !hasR) shadowList.push(`${dw} ${dw} 0 0 ${outlineColor}`);
                if (!hasB && !hasL) shadowList.push(`-${dw} ${dw} 0 0 ${outlineColor}`);
                if (isDragging) shadowList.push('0 40px 100px rgba(0,0,0,1)');

                return (
                  <div 
                    key={p.id}
                    onMouseDown={e => handleDragStart(e, p)}
                    onTouchStart={e => handleDragStart(e, p)}
                    className={`absolute cursor-grab active:cursor-grabbing ${snapping ? 'snap-anim' : ''}`}
                    style={{
                      width: `calc(${cellW}% + 0.6px)`,
                      height: `calc(${cellH}% + 0.6px)`,
                      left: `${l}%`,
                      top: `${t}%`,
                      zIndex: isDragging ? 100 : (snapping ? 90 : 10),
                      backgroundImage: `url(${image})`,
                      backgroundSize: `${gridSize * 100}% ${gridSize * 100}%`,
                      backgroundPosition: `${(p.correctX / (gridSize - 1)) * 100}% ${(p.correctY / (gridSize - 1)) * 100}%`,
                      transition: isDragging ? 'none' : `all 0.65s cubic-bezier(0.19, 1, 0.22, 1)`,
                      transitionDelay: `${p.delay || 0}ms`,
                      borderRight: hasR ? '0' : '1.5px solid rgba(255,255,255,0.3)',
                      borderLeft: hasL ? '0' : '1.5px solid rgba(255,255,255,0.3)',
                      borderTop: hasT ? '0' : '1.5px solid rgba(255,255,255,0.3)',
                      borderBottom: hasB ? '0' : '1.5px solid rgba(255,255,255,0.3)',
                      borderTopLeftRadius: (!hasT && !hasL) ? '12px' : '0',
                      borderTopRightRadius: (!hasT && !hasR) ? '12px' : '0',
                      borderBottomLeftRadius: (!hasB && !hasL) ? '12px' : '0',
                      borderBottomRightRadius: (!hasB && !hasR) ? '12px' : '0',
                      boxShadow: shadowList.length > 0 ? shadowList.join(', ') : 'none',
                      willChange: 'transform, left, top' // Performance hint voor de browser
                    }}
                  />
                );
              })}

              {gameState === 'won' && (
                <div className="glimmer-layer">
                  <div className="glimmer-bar" />
                </div>
              )}
            </div>
          </div>

          <div className="mt-12">
            {gameState === 'won' ? (
              <button 
                onClick={() => setGameState('setup')} 
                className="bg-white text-black px-12 py-5 rounded-[2.5rem] font-black text-sm active:scale-95 transition-all shadow-[0_20px_50px_rgba(255,255,255,0.15)] animate-in slide-in-from-bottom-4 duration-700"
              >
                OPNIEUW BEGINNEN
              </button>
            ) : (
              <button 
                onClick={() => setGameState('setup')} 
                className="p-5 bg-neutral-900 rounded-full text-neutral-600 hover:text-white transition-all active:scale-90"
              >
                <RefreshCw size={24} />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
