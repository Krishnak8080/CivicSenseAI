import { useState, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { UploadCloud, MapPin, AlignLeft, ArrowRight, ArrowLeft, CheckCircle2, Image as ImageIcon } from 'lucide-react';
import { LocationAutocompleteInput } from './LocationAutocompleteInput';
import type { LocationData } from './LocationAutocompleteInput';

interface ReportFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export function ReportForm({ onSuccess, onCancel }: ReportFormProps) {
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  
  const [locationData, setLocationData] = useState<LocationData | null>(null);
  const [locationError, setLocationError] = useState('');
  
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleLocationSelect = (location: LocationData) => {
    setLocationData(location);
    setLocationError('');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
      const url = URL.createObjectURL(selected);
      setPreviewUrl(url);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const dropped = e.dataTransfer.files?.[0];
    if (dropped && dropped.type.startsWith('image/')) {
      setFile(dropped);
      setPreviewUrl(URL.createObjectURL(dropped));
    }
  };

  const nextStep = () => setStep(s => Math.min(s + 1, 3));
  const prevStep = () => setStep(s => Math.max(s - 1, 1));

  const handleSubmit = async () => {
    if (!user) return;
    
    if (!locationData) {
      setLocationError('Please select a location');
      return;
    }
    
    setLoading(true);
    try {
      // 1. Upload image if exists
      let photo_url = null;
      if (file) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `${user.id}/${fileName}`;
        
        const { error: uploadError } = await supabase.storage
          .from('report-photos')
          .upload(filePath, file);
          
        if (uploadError) throw uploadError;
        
        const { data } = supabase.storage
          .from('report-photos')
          .getPublicUrl(filePath);
          
        photo_url = data.publicUrl;
      }

      // 2. Send to backend for AI analysis and save
      const reportData = {
        title,
        description,
        photo_url,
        latitude: locationData.latitude,
        longitude: locationData.longitude,
        address: locationData.address,
        formatted_address: locationData.formatted_address,
        user_id: user.id
      };

      const response = await fetch('http://localhost:8000/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reportData)
      });
      
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Failed to save report');
      }

      toast.success('Issue Reported Successfully!', {
        description: 'Thank you for making our community better.'
      });
      onSuccess();
    } catch (error: any) {
      toast.error(error.message || 'Failed to submit report');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[var(--bg-card)]">
      {/* Header & Progress */}
      <div className="p-6 border-b border-[var(--border-subtle)] bg-[var(--bg-secondary)] relative overflow-hidden">
        {/* Glow effect */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--orange-primary)]/10 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2 pointer-events-none" />
        
        <h2 className="text-2xl font-bold text-white mb-6 relative z-10">Report Civic Issue</h2>
        
        <div className="flex items-center justify-between relative z-10">
          {[
            { num: 1, label: 'Details', icon: AlignLeft },
            { num: 2, label: 'Photo', icon: ImageIcon },
            { num: 3, label: 'Location', icon: MapPin }
          ].map((s, i) => (
            <div key={s.num} className="flex flex-col items-center relative z-10">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300
                ${step === s.num 
                  ? 'border-[var(--orange-primary)] bg-[var(--orange-primary)]/20 text-[var(--orange-primary)] shadow-[0_0_15px_rgba(255,107,53,0.3)]' 
                  : step > s.num 
                    ? 'border-[var(--orange-primary)] bg-[var(--orange-primary)] text-white'
                    : 'border-[var(--border-subtle)] bg-[var(--bg-elevated)] text-[var(--text-muted)]'
                }`}
              >
                {step > s.num ? <CheckCircle2 className="w-5 h-5" /> : <s.icon className="w-5 h-5" />}
              </div>
              <span className={`text-xs mt-2 font-medium ${step >= s.num ? 'text-white' : 'text-[var(--text-muted)]'}`}>
                {s.label}
              </span>
              
              {/* Connecting line */}
              {i < 2 && (
                <div className="absolute top-5 left-10 w-full h-[2px] bg-[var(--border-subtle)] -z-10 w-[calc(100vw/3-40px)] sm:w-[150px]">
                  <div 
                    className="h-full bg-[var(--orange-primary)] transition-all duration-500"
                    style={{ width: step > s.num ? '100%' : '0%' }}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Form Content */}
      <div className="flex-1 p-6 overflow-hidden relative">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-5 h-full"
            >
              <div>
                <label className="text-sm font-medium text-[var(--text-secondary)] mb-2 block">Issue Title</label>
                <Input 
                  value={title} 
                  onChange={e => setTitle(e.target.value)} 
                  className="bg-[var(--bg-secondary)] border-[var(--border-subtle)] text-white focus-visible:ring-[var(--orange-primary)] h-12"
                  placeholder="e.g., Massive pothole on 5th Avenue"
                  autoFocus
                />
              </div>
              <div>
                <label className="text-sm font-medium text-[var(--text-secondary)] mb-2 block">Detailed Description</label>
                <Textarea 
                  value={description} 
                  onChange={e => setDescription(e.target.value)} 
                  className="bg-[var(--bg-secondary)] border-[var(--border-subtle)] text-white focus-visible:ring-[var(--orange-primary)] min-h-[150px] resize-none"
                  placeholder="Describe the issue, potential hazards, and how long it's been there..."
                />
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="h-full flex flex-col"
            >
              <div 
                className={`flex-1 border-2 border-dashed rounded-xl flex flex-col items-center justify-center p-6 transition-colors duration-200 cursor-pointer relative overflow-hidden
                  ${previewUrl ? 'border-[var(--orange-primary)]/50 bg-[var(--orange-primary)]/5' : 'border-[var(--border-subtle)] hover:border-[var(--orange-primary)]/50 hover:bg-[var(--bg-elevated)]'}
                `}
                onDragOver={e => e.preventDefault()}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileChange} 
                  accept="image/*" 
                  className="hidden" 
                />
                
                {previewUrl ? (
                  <>
                    <img src={previewUrl} alt="Preview" className="absolute inset-0 w-full h-full object-cover opacity-60" />
                    <div className="relative z-10 bg-black/60 px-4 py-2 rounded-lg backdrop-blur-md border border-white/10 flex items-center">
                      <CheckCircle2 className="w-5 h-5 text-green-400 mr-2" />
                      <span className="text-white font-medium">Image attached. Click to replace.</span>
                    </div>
                  </>
                ) : (
                  <div className="text-center">
                    <div className="w-16 h-16 rounded-full bg-[var(--bg-secondary)] flex items-center justify-center mx-auto mb-4">
                      <UploadCloud className="w-8 h-8 text-[var(--orange-primary)]" />
                    </div>
                    <h3 className="text-lg font-medium text-white mb-1">Upload Photo Evidence</h3>
                    <p className="text-[var(--text-muted)] text-sm mb-4">Drag and drop or click to browse</p>
                    <p className="text-xs text-[var(--text-disabled)]">Supports: JPG, PNG (Max 5MB)</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-5"
            >
              <LocationAutocompleteInput
                onLocationSelect={handleLocationSelect}
                error={locationError}
              />

              {/* Summary Block */}
              <div className="mt-8 p-4 bg-[var(--bg-secondary)] rounded-lg border border-[var(--border-subtle)]">
                <h4 className="text-sm font-semibold text-white mb-2">Ready to Submit</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex">
                    <span className="text-[var(--text-muted)] w-20">Title:</span>
                    <span className="text-white truncate">{title || 'Not provided'}</span>
                  </div>
                  <div className="flex">
                    <span className="text-[var(--text-muted)] w-20">Photo:</span>
                    <span className={file ? 'text-green-400' : 'text-yellow-500'}>
                      {file ? 'Attached' : 'None provided'}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer Actions */}
      <div className="p-6 border-t border-[var(--border-subtle)] bg-[var(--bg-secondary)] flex justify-between items-center">
        <Button 
          type="button" 
          variant="ghost" 
          onClick={step === 1 ? onCancel : prevStep}
          className="text-[var(--text-secondary)] hover:text-white"
        >
          {step === 1 ? 'Cancel' : (
            <>
              <ArrowLeft className="w-4 h-4 mr-2" /> Back
            </>
          )}
        </Button>
        
        {step < 3 ? (
          <Button 
            type="button"
            onClick={nextStep}
            disabled={step === 1 && (!title || !description)}
            className="bg-[var(--bg-elevated)] hover:bg-[var(--border-subtle)] text-white border border-[var(--border-subtle)]"
          >
            Continue <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        ) : (
          <Button 
            type="button"
            onClick={handleSubmit}
            disabled={loading || !locationData}
            className="bg-[var(--orange-primary)] hover:bg-[var(--orange-hover)] text-white font-bold hover:shadow-glow transition-all"
          >
            {loading ? 'Analyzing & Submitting...' : 'Submit Report'}
          </Button>
        )}
      </div>
    </div>
  );
}
