'use client';

import { useState, useRef } from 'react';
import RoboflowWorkflowService from '@/services/roboflowWorkflowService';

export default function TestYOLOv8Page() {
  const [image, setImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [configStatus, setConfigStatus] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [service] = useState(() => new RoboflowWorkflowService());

  const checkConfiguration = () => {
    const status = service.getConfigStatus();
    setConfigStatus(status);
    return service.isConfigured();
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setImage(result);
      setResult(null);
      setError(null);
    };
    reader.readAsDataURL(file);
  };

  const handleTest = async () => {
    if (!image) {
      setError('Seleziona prima un\'immagine');
      return;
    }

    if (!checkConfiguration()) {
      setError('Roboflow non è configurato. Controlla le variabili d\'ambiente.');
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    setResult(null);

    try {
      console.log('[Test YOLOv8] Starting analysis...');
      const analysis = await service.analyzeImage(image);
      console.log('[Test YOLOv8] Analysis result:', analysis);
      setResult(analysis);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Errore sconosciuto';
      console.error('[Test YOLOv8] Error:', err);
      setError(errorMessage);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const formatConfidence = (conf: number) => {
    return (conf * 100).toFixed(1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0f1a] via-[#0d1420] to-[#0a0f1a] p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">🧪 Test YOLOv8</h1>
          <p className="text-slate-400">Pagina di test per verificare il funzionamento di YOLOv8 con Roboflow</p>
        </div>

        {/* Configuration Status */}
        <div className="card-gradient rounded-xl p-6 mb-6">
          <h2 className="text-xl font-bold text-white mb-4">⚙️ Stato Configurazione</h2>
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span className={`w-3 h-3 rounded-full ${configStatus?.apiKey ? 'bg-green-500' : 'bg-red-500'}`}></span>
              <span className="text-slate-300">
                NEXT_PUBLIC_ROBOFLOW_API_KEY: {configStatus?.apiKey ? '✅ Configurato' : '❌ Mancante'}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className={`w-3 h-3 rounded-full ${configStatus?.workflowUrl ? 'bg-green-500' : 'bg-red-500'}`}></span>
              <span className="text-slate-300">
                NEXT_PUBLIC_ROBOFLOW_WORKFLOW_URL: {configStatus?.workflowUrl ? '✅ Configurato' : '❌ Mancante'}
              </span>
            </div>
            {!service.isConfigured() && (
              <div className="mt-4 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                <p className="text-yellow-400 text-sm">
                  ⚠️ Aggiungi le variabili d'ambiente in <code className="bg-slate-800 px-2 py-1 rounded">.env.local</code>
                </p>
                <pre className="mt-2 text-xs text-slate-300 bg-slate-900 p-3 rounded overflow-x-auto">
{`NEXT_PUBLIC_ROBOFLOW_API_KEY=your-api-key
NEXT_PUBLIC_ROBOFLOW_WORKFLOW_URL=https://serverless.roboflow.com/...`}
                </pre>
              </div>
            )}
          </div>
        </div>

        {/* Image Upload */}
        <div className="card-gradient rounded-xl p-6 mb-6">
          <h2 className="text-xl font-bold text-white mb-4">📸 Carica Immagine</h2>
          <div className="space-y-4">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageSelect}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-500 text-white rounded-lg font-semibold hover:opacity-90 transition"
            >
              Seleziona Immagine
            </button>
            
            {image && (
              <div className="mt-4">
                <img
                  src={image}
                  alt="Preview"
                  className="max-w-full max-h-96 object-contain rounded-lg border border-slate-700"
                />
              </div>
            )}
          </div>
        </div>

        {/* Test Button */}
        {image && (
          <div className="mb-6">
            <button
              onClick={handleTest}
              disabled={isAnalyzing || !service.isConfigured()}
              className="px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg font-bold text-lg hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isAnalyzing ? '🔄 Analizzando...' : '🚀 Testa YOLOv8'}
            </button>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="card-gradient rounded-xl p-6 mb-6 border border-red-500/30">
            <h2 className="text-xl font-bold text-red-400 mb-2">❌ Errore</h2>
            <p className="text-slate-300">{error}</p>
          </div>
        )}

        {/* Results Display */}
        {result && (
          <div className="card-gradient rounded-xl p-6 space-y-6">
            <h2 className="text-2xl font-bold text-white">✅ Risultati Analisi YOLOv8</h2>

            {/* Main Prediction */}
            <div className="bg-gradient-to-r from-cyan-500/10 to-purple-500/10 rounded-lg p-6 border border-cyan-500/30">
              <h3 className="text-xl font-bold text-white mb-4">🎯 Predizione Principale</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-slate-400 text-sm">Nome Alimento</p>
                  <p className="text-2xl font-bold text-cyan-400">{result.foodName}</p>
                </div>
                <div>
                  <p className="text-slate-400 text-sm">Confidenza</p>
                  <p className="text-2xl font-bold text-green-400">{formatConfidence(result.confidence)}%</p>
                </div>
                <div>
                  <p className="text-slate-400 text-sm">Categoria</p>
                  <p className="text-lg font-semibold text-white capitalize">{result.category}</p>
                </div>
                <div>
                  <p className="text-slate-400 text-sm">Freschezza</p>
                  <p className={`text-lg font-semibold ${
                    result.freshness === 'fresh' ? 'text-green-400' :
                    result.freshness === 'spoiled' ? 'text-red-400' :
                    'text-yellow-400'
                  }`}>
                    {result.freshness === 'fresh' ? '✅ Fresco' :
                     result.freshness === 'spoiled' ? '❌ Marcio' :
                     result.freshness === 'stale' ? '⚠️ Non Fresco' :
                     result.freshness}
                  </p>
                </div>
              </div>
            </div>

            {/* All Predictions */}
            {result.allPredictions && result.allPredictions.length > 0 && (
              <div>
                <h3 className="text-xl font-bold text-white mb-4">📊 Tutte le Predizioni</h3>
                <div className="space-y-2">
                  {result.allPredictions.map((pred: any, index: number) => (
                    <div
                      key={index}
                      className="bg-slate-800/50 rounded-lg p-4 flex items-center justify-between"
                    >
                      <div className="flex-1">
                        <p className="text-white font-semibold">{pred.class || 'Unknown'}</p>
                        {pred.x !== undefined && pred.y !== undefined && (
                          <p className="text-slate-400 text-xs">
                            Posizione: ({Math.round(pred.x)}, {Math.round(pred.y)})
                            {pred.width && pred.height && (
                              <> - Dimensione: {Math.round(pred.width)}x{Math.round(pred.height)}</>
                            )}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-cyan-400 font-bold">{formatConfidence(pred.confidence)}%</p>
                        <div className="w-32 h-2 bg-slate-700 rounded-full mt-1">
                          <div
                            className="h-2 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full"
                            style={{ width: `${pred.confidence * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Raw JSON */}
            <details className="mt-6">
              <summary className="cursor-pointer text-slate-400 hover:text-white font-semibold">
                🔍 Mostra JSON Raw
              </summary>
              <pre className="mt-4 p-4 bg-slate-900 rounded-lg overflow-x-auto text-xs text-slate-300">
                {JSON.stringify(result, null, 2)}
              </pre>
            </details>
          </div>
        )}

        {/* Instructions */}
        <div className="mt-8 card-gradient rounded-xl p-6">
          <h2 className="text-xl font-bold text-white mb-4">📖 Istruzioni</h2>
          <ol className="list-decimal list-inside space-y-2 text-slate-300">
            <li>Verifica che le variabili d'ambiente siano configurate correttamente</li>
            <li>Carica un'immagine di cibo (frutta, verdura, ecc.)</li>
            <li>Clicca su "Testa YOLOv8" per avviare l'analisi</li>
            <li>Visualizza i risultati: predizioni, confidenza e freschezza</li>
            <li>Controlla la console del browser per i log dettagliati</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
