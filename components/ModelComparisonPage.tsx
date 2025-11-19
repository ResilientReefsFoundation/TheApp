import * as React from 'react';

const ModelViewer = 'model-viewer' as any;

const ModelViewerPlaceholder: React.FC<{ onFileChange: (file: File) => void; modelLabel: string; }> = ({ onFileChange, modelLabel }) => (
    <div className="w-full h-full border-2 border-dashed border-gray-300 rounded-lg flex flex-col justify-center items-center text-center p-4 bg-gray-50">
        <h3 className="text-lg font-semibold text-gray-700">Model {modelLabel}</h3>
        <p className="text-sm text-gray-500 mt-2">Load a .glb, .gltf, or .obj file to begin comparison.</p>
        <label className="mt-4 bg-ocean-blue hover:bg-opacity-90 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-200 cursor-pointer">
            <span>Load Model</span>
            <input
                type="file"
                className="hidden"
                accept=".glb,.gltf,.obj"
                onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                        onFileChange(e.target.files[0]);
                    }
                }}
            />
        </label>
    </div>
);

const ModelComparisonPage: React.FC<{ onNavigateBack: () => void; }> = ({ onNavigateBack }) => {
    const [modelA, setModelA] = React.useState<string | null>('https://modelviewer.dev/shared-assets/models/Astronaut.glb');
    const [modelB, setModelB] = React.useState<string | null>('https://modelviewer.dev/shared-assets/models/Horse.glb');
    const [opacity, setOpacity] = React.useState(0.5);

    const handleFileChange = (file: File, setModel: React.Dispatch<React.SetStateAction<string | null>>, currentModel: string | null) => {
        // Revoke old object URL if it exists and is not a sample URL
        if (currentModel && currentModel.startsWith('blob:')) {
            URL.revokeObjectURL(currentModel);
        }
        const url = URL.createObjectURL(file);
        setModel(url);
    };
    
    // Cleanup object URLs on unmount
    React.useEffect(() => {
        return () => {
            if (modelA && modelA.startsWith('blob:')) URL.revokeObjectURL(modelA);
            if (modelB && modelB.startsWith('blob:')) URL.revokeObjectURL(modelB);
        };
    }, [modelA, modelB]);

    return (
        <div className="bg-white p-4 sm:p-6 rounded-xl shadow-lg space-y-6 flex flex-col">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center border-b pb-4">
                <h2 className="text-2xl font-bold text-deep-sea">3D Model Comparison</h2>
                <button
                    onClick={onNavigateBack}
                    className="bg-gray-200 hover:bg-gray-300 text-deep-sea font-bold py-2 px-4 rounded-lg transition-colors duration-200 self-start sm:self-center"
                >
                    &larr; Back
                </button>
            </div>

            <div className="flex-grow relative min-h-[300px] h-[60vh] bg-gray-100 rounded-lg overflow-hidden">
                {modelA ? (
                    <ModelViewer
                        src={modelA}
                        alt="Model A"
                        cameraControls
                        autoRotate
                        style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0, backgroundColor: '#f3f4f6' }}
                    />
                ) : (
                    <div className="absolute inset-0 p-4"><ModelViewerPlaceholder onFileChange={(file) => handleFileChange(file, setModelA, modelA)} modelLabel="A (Base)" /></div>
                )}
                
                {modelB ? (
                     <ModelViewer
                        src={modelB}
                        alt="Model B"
                        cameraControls
                        style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0, opacity: opacity, touchAction: 'none', backgroundColor: 'transparent' }}
                    />
                ) : (
                    modelA && <div className="absolute inset-0 p-4"><ModelViewerPlaceholder onFileChange={(file) => handleFileChange(file, setModelB, modelB)} modelLabel="B (Overlay)" /></div>
                )}
            </div>
            
            <div className="pt-6 border-t border-gray-200 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col">
                        <label className="text-sm font-medium text-gray-700 mb-1">Model A (Base)</label>
                         <input
                            type="file"
                            className="block w-full text-sm text-deep-sea bg-white rounded-lg border border-ocean-blue cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-ocean-blue/10 file:text-ocean-blue hover:file:bg-ocean-blue/20"
                            accept=".glb,.gltf,.obj"
                            onChange={(e) => e.target.files && handleFileChange(e.target.files[0], setModelA, modelA)}
                        />
                    </div>
                     <div className="flex flex-col">
                        <label className="text-sm font-medium text-gray-700 mb-1">Model B (Overlay)</label>
                        <input
                            type="file"
                            className="block w-full text-sm text-deep-sea bg-white rounded-lg border border-ocean-blue cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-ocean-blue/10 file:text-ocean-blue hover:file:bg-ocean-blue/20"
                            accept=".glb,.gltf,.obj"
                            onChange={(e) => e.target.files && handleFileChange(e.target.files[0], setModelB, modelB)}
                        />
                    </div>
                </div>
                <div>
                     <label htmlFor="opacity-slider" className="block text-sm font-medium text-gray-700">
                        Overlay Opacity: {Math.round(opacity * 100)}%
                     </label>
                     <input
                        id="opacity-slider"
                        type="range"
                        min="0"
                        max="1"
                        step="0.01"
                        value={opacity}
                        onChange={(e) => setOpacity(parseFloat(e.target.value))}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-ocean-blue"
                        disabled={!modelA || !modelB}
                    />
                </div>
            </div>
        </div>
    );
};

export default ModelComparisonPage;