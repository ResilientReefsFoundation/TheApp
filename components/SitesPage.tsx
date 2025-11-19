import * as React from 'react';
import type { FormEvent, ChangeEvent } from 'react';
import type { Site } from '../types';
import { CloseIcon, PencilIcon, UploadIcon } from './Icons';

interface SitesPageProps {
  sites: Site[];
  onAddSite: (name: string, photoUrl: string) => void;
  onUpdateSite: (updatedSite: Site) => void;
  onNavigateBack: () => void;
}

const EditSiteModal: React.FC<{
  site: Site;
  onClose: () => void;
  onUpdateSite: (updatedSite: Site) => void;
}> = ({ site, onClose, onUpdateSite }) => {
  const [name, setName] = React.useState(site.name);
  const [photo, setPhoto] = React.useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = React.useState<string>(site.photoUrl);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setPhoto(file);
      if (previewUrl && previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onUpdateSite({ ...site, name, photoUrl: previewUrl });
    onClose();
  };
  
  // Cleanup object URL on unmount
  React.useEffect(() => {
    return () => {
        if (previewUrl && previewUrl.startsWith('blob:')) {
            URL.revokeObjectURL(previewUrl);
        }
    };
  }, [previewUrl]);

  return (
     <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md relative">
        <form onSubmit={handleSubmit}>
            <header className="p-4 border-b flex justify-between items-center">
              <h2 className="text-xl font-bold text-deep-sea">Edit Site</h2>
              <button type="button" onClick={onClose} className="text-gray-500 hover:text-gray-800">
                <CloseIcon className="w-6 h-6"/>
              </button>
            </header>
            <div className="p-6 space-y-4">
                <div>
                    <label htmlFor="siteNameEdit" className="block text-sm font-medium text-gray-700">Site Name</label>
                    <input type="text" id="siteNameEdit" value={name} onChange={e => setName(e.target.value)} required className="mt-1 block w-full rounded-md border border-ocean-blue shadow-sm p-2 bg-white text-gray-900"/>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Site Photo</label>
                    <div className="mt-1 flex items-center gap-4">
                        <img src={previewUrl} alt="Site preview" className="w-24 h-24 object-cover rounded-lg"/>
                        <label className="cursor-pointer bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50">
                            <span>Change</span>
                            <input type="file" className="sr-only" onChange={handleFileChange} accept="image/*"/>
                        </label>
                    </div>
                </div>
            </div>
            <footer className="p-4 bg-gray-50 rounded-b-2xl flex justify-end gap-2">
                <button type="button" onClick={onClose} className="bg-gray-200 hover:bg-gray-300 text-deep-sea font-bold py-2 px-4 rounded-lg">Cancel</button>
                <button type="submit" className="bg-seafoam-green text-deep-sea font-bold py-2 px-4 rounded-lg">Save Changes</button>
            </footer>
        </form>
      </div>
    </div>
  );
};

const SitesPage: React.FC<SitesPageProps> = ({ sites, onAddSite, onUpdateSite, onNavigateBack }) => {
  const [newSiteName, setNewSiteName] = React.useState('');
  const [newSitePhoto, setNewSitePhoto] = React.useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);
  const [editingSite, setEditingSite] = React.useState<Site | null>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setNewSitePhoto(file);
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleAddSite = (e: FormEvent) => {
    e.preventDefault();
    if (newSiteName.trim() && previewUrl) {
      onAddSite(newSiteName.trim(), previewUrl);
      // Reset form
      setNewSiteName('');
      setNewSitePhoto(null);
      setPreviewUrl(null);
    } else {
      alert('Please provide a site name and a photo.');
    }
  };

  return (
    <>
      <div className="bg-white p-4 sm:p-6 rounded-xl shadow-lg space-y-8">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center border-b pb-4">
          <h2 className="text-2xl font-bold text-deep-sea mb-2 sm:mb-0">Manage Sites</h2>
          <button
            onClick={onNavigateBack}
            className="bg-gray-200 hover:bg-gray-300 text-deep-sea font-bold py-2 px-4 rounded-lg transition-colors duration-200 self-start sm:self-center"
          >
            &larr; Back to Add/Edit Items
          </button>
        </div>

        {/* Add New Site Form */}
        <form onSubmit={handleAddSite} className="p-4 border rounded-lg space-y-4 bg-gray-50">
          <h3 className="font-semibold text-gray-700 text-lg">Add New Site</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
            <div>
              <label htmlFor="siteName" className="block text-sm font-medium text-gray-700">Site Name</label>
              <input type="text" id="siteName" value={newSiteName} onChange={e => setNewSiteName(e.target.value)} required className="mt-1 block w-full rounded-md border border-ocean-blue shadow-sm p-2 bg-white text-gray-900"/>
            </div>
            <div className="flex items-end gap-4">
              {previewUrl && <img src={previewUrl} alt="Preview" className="w-20 h-20 object-cover rounded-lg"/>}
              <div className="flex-grow">
                 <label htmlFor="sitePhoto" className="block text-sm font-medium text-gray-700">Site Photo</label>
                 <input type="file" id="sitePhoto" onChange={handleFileChange} required accept="image/*" className="mt-1 block w-full text-sm text-deep-sea bg-white rounded-lg border border-ocean-blue cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-ocean-blue/10 file:text-ocean-blue hover:file:bg-ocean-blue/20"/>
              </div>
            </div>
          </div>
          <div className="flex justify-end">
            <button type="submit" className="bg-ocean-blue hover:bg-opacity-90 text-white font-bold py-2 px-4 rounded-lg">
              Add Site
            </button>
          </div>
        </form>

        {/* Existing Sites List */}
        <div>
          <h3 className="font-semibold text-gray-700 text-lg mb-4">Current Sites</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {sites.map(site => (
              <div key={site.id} className="border rounded-lg shadow-sm overflow-hidden group">
                <img src={site.photoUrl} alt={site.name} className="w-full h-40 object-cover"/>
                <div className="p-4 flex justify-between items-center">
                  <h4 className="font-bold text-deep-sea">{site.name}</h4>
                  <button onClick={() => setEditingSite(site)} className="p-2 rounded-full hover:bg-gray-100 opacity-0 group-hover:opacity-100 transition-opacity">
                    <PencilIcon className="w-5 h-5 text-gray-600"/>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      {editingSite && (
        <EditSiteModal
            site={editingSite}
            onClose={() => setEditingSite(null)}
            onUpdateSite={onUpdateSite}
        />
      )}
    </>
  );
};

export default SitesPage;