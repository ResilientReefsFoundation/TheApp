import * as React from 'react';
import type { FormEvent } from 'react';
import type { Species } from '../types';
import { BookOpenIcon, PencilIcon } from './Icons';

interface SpeciesIdPageProps {
  speciesList: Species[];
  selectedSpeciesId: string | null;
  onOpenPhotoManager: (speciesId: string) => void;
  onUpdateSpecies: (updatedSpecies: Species) => void;
  onAddSpecies: (genus: string, species: string) => void;
  onNavigateToSpeciesDetail: (speciesId: string) => void;
  onNavigateBack: () => void; // From detail to list
  onNavigateBackToMenu: () => void; // from list to main app
}

const SpeciesDetailView: React.FC<{
    species: Species;
    onNavigateBack: () => void;
    onOpenPhotoManager: (speciesId: string) => void;
    onUpdateSpecies: (updatedSpecies: Species) => void;
}> = ({ species, onNavigateBack, onOpenPhotoManager, onUpdateSpecies }) => {
    const [notes, setNotes] = React.useState(species.notes);
    const [externalLink, setExternalLink] = React.useState(species.externalLink || '');
    const [isEditing, setIsEditing] = React.useState(false);
    
    const mainPhoto = species.photos.find(p => p.isMain) || species.photos[0];

    // This effect ensures that if the user navigates between species details
    // without leaving the page, the state is correctly reset for the new species.
    React.useEffect(() => {
        setNotes(species.notes);
        setExternalLink(species.externalLink || '');
        setIsEditing(false);
    }, [species]);
    
    const handleSave = () => {
        // Trim the link to avoid saving whitespace
        onUpdateSpecies({ ...species, notes, externalLink: externalLink.trim() });
        setIsEditing(false);
    };

    const handleCancel = () => {
        // Revert changes to their original state from props
        setNotes(species.notes);
        setExternalLink(species.externalLink || '');
        setIsEditing(false);
    };

    return (
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow-lg space-y-6">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center border-b pb-4">
                <div>
                    <h2 className="text-2xl font-bold text-deep-sea mb-1 sm:mb-0 italic">{species.genus} {species.species}</h2>
                    <button onClick={onNavigateBack} className="text-sm text-ocean-blue hover:underline font-semibold">&larr; Back to Species List</button>
                </div>
                {!isEditing && (
                    <button onClick={() => setIsEditing(true)} className="bg-gray-200 hover:bg-gray-300 text-deep-sea font-bold py-2 px-4 rounded-lg flex items-center gap-2 self-start sm:self-center">
                        <PencilIcon className="w-4 h-4" /> Edit
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                <div className="space-y-4">
                    <h3 className="font-semibold text-gray-700 text-lg">Reference Photos</h3>
                    <div onClick={() => onOpenPhotoManager(species.id)} className="cursor-pointer group aspect-video" role="button">
                        {mainPhoto ? (
                            <img src={mainPhoto.url} alt="Species main" className="w-full h-full object-cover rounded-lg shadow-md transition-transform transform group-hover:scale-105" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-lg border-2 border-dashed"><p className="text-gray-500">Click to add photos</p></div>
                        )}
                    </div>
                    <p className="text-xs text-center text-gray-500">Click image to manage photo album.</p>
                </div>

                <div className="space-y-4">
                    <div>
                        <h3 className="font-semibold text-gray-700 text-lg">Notes</h3>
                        <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={isEditing ? 8 : 5} disabled={!isEditing} className="w-full p-2 border border-ocean-blue rounded-md shadow-sm focus:ring-ocean-blue bg-white text-gray-900 disabled:bg-gray-50 disabled:text-gray-600"/>
                    </div>
                     <div>
                        <h3 className="font-semibold text-gray-700 text-lg">External Link</h3>
                        <input type="url" value={externalLink} onChange={e => setExternalLink(e.target.value)} disabled={!isEditing} placeholder="https://..." className="w-full p-2 border border-ocean-blue rounded-md shadow-sm focus:ring-ocean-blue bg-white text-gray-900 disabled:bg-gray-50 disabled:text-gray-600"/>
                    </div>

                    {isEditing ? (
                        <div className="flex justify-end gap-2">
                            <button onClick={handleCancel} className="bg-gray-200 hover:bg-gray-300 text-deep-sea font-bold py-2 px-4 rounded-lg">Cancel</button>
                            <button onClick={handleSave} className="bg-seafoam-green hover:bg-opacity-90 text-deep-sea font-bold py-2 px-4 rounded-lg">Save Changes</button>
                        </div>
                    ) : (
                        externalLink ? (
                            <a href={externalLink} target="_blank" rel="noopener noreferrer" className="w-full flex items-center justify-center gap-2 bg-ocean-blue hover:bg-opacity-90 text-white font-bold py-3 px-4 rounded-lg">
                                <BookOpenIcon className="w-5 h-5"/> View Fact Sheet
                            </a>
                        ) : (
                            <button disabled className="w-full flex items-center justify-center gap-2 bg-gray-300 text-gray-500 font-bold py-3 px-4 rounded-lg cursor-not-allowed">
                                 <BookOpenIcon className="w-5 h-5"/> No Link Available
                            </button>
                        )
                    )}
                </div>
            </div>
        </div>
    );
};

const SpeciesListPage: React.FC<{
    speciesList: Species[];
    onNavigateBackToMenu: () => void;
    onAddSpecies: (genus: string, species: string) => void;
    onNavigateToSpeciesDetail: (speciesId: string) => void;
}> = ({ speciesList, onNavigateBackToMenu, onAddSpecies, onNavigateToSpeciesDetail }) => {
    const [genus, setGenus] = React.useState('');
    const [species, setSpecies] = React.useState('');

    const handleAddSubmit = (e: FormEvent) => {
        e.preventDefault();
        if (genus.trim() && species.trim()) {
            onAddSpecies(genus.trim(), species.trim());
            setGenus('');
            setSpecies('');
        }
    };

    return (
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow-lg space-y-6">
             <div className="flex flex-col sm:flex-row justify-between sm:items-center border-b pb-4">
                <h2 className="text-2xl font-bold text-deep-sea mb-2 sm:mb-0">Species Identification</h2>
                <button onClick={onNavigateBackToMenu} className="bg-gray-200 hover:bg-gray-300 text-deep-sea font-bold py-2 px-4 rounded-lg self-start sm:self-center">
                    &larr; Back to Details
                </button>
            </div>

            <form onSubmit={handleAddSubmit} className="p-4 border rounded-lg space-y-4 bg-gray-50">
                <h3 className="font-semibold text-gray-700 text-lg">Add New Species</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                    <div className="md:col-span-1">
                        <label htmlFor="genus" className="block text-sm font-medium text-gray-700">Genus</label>
                        <input type="text" id="genus" value={genus} onChange={e => setGenus(e.target.value)} required placeholder="e.g., Acropora" className="mt-1 block w-full rounded-md border border-ocean-blue shadow-sm p-2 bg-white text-gray-900" />
                    </div>
                    <div className="md:col-span-1">
                        <label htmlFor="species" className="block text-sm font-medium text-gray-700">Species</label>
                        <input type="text" id="species" value={species} onChange={e => setSpecies(e.target.value)} required placeholder="e.g., cervicornis" className="mt-1 block w-full rounded-md border border-ocean-blue shadow-sm p-2 bg-white text-gray-900" />
                    </div>
                    <div className="flex justify-end">
                        <button type="submit" className="w-full bg-ocean-blue hover:bg-opacity-90 text-white font-bold py-2 px-4 rounded-lg">Add Species</button>
                    </div>
                </div>
            </form>

             <div>
                <h3 className="font-semibold text-gray-700 text-lg mb-4">Cataloged Species</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {speciesList.map(s => (
                        <button key={s.id} onClick={() => onNavigateToSpeciesDetail(s.id)} className="p-4 bg-gray-50 hover:bg-ocean-blue/10 border border-gray-200 rounded-lg text-left transition-colors shadow-sm hover:shadow-md">
                            <h4 className="font-semibold text-deep-sea italic">{s.genus} {s.species}</h4>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};


const SpeciesIdPage: React.FC<SpeciesIdPageProps> = (props) => {
    const { speciesList, selectedSpeciesId, onNavigateToSpeciesDetail, onAddSpecies, onNavigateBackToMenu, onUpdateSpecies, onOpenPhotoManager, onNavigateBack } = props;

    const selectedSpecies = React.useMemo(() => speciesList.find(s => s.id === selectedSpeciesId) || null, [speciesList, selectedSpeciesId]);

    if (!selectedSpecies) {
        return (
            <SpeciesListPage
                speciesList={speciesList}
                onAddSpecies={onAddSpecies}
                onNavigateBackToMenu={onNavigateBackToMenu}
                onNavigateToSpeciesDetail={onNavigateToSpeciesDetail}
            />
        );
    }
    
    return (
        <SpeciesDetailView
            species={selectedSpecies}
            onNavigateBack={onNavigateBack}
            onOpenPhotoManager={onOpenPhotoManager}
            onUpdateSpecies={onUpdateSpecies}
        />
    );
};

export default SpeciesIdPage;