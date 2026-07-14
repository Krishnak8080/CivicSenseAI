import { useState, useRef, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useUserLocation } from '../contexts/LocationContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import {
  UploadCloud,
  MapPin,
  AlignLeft,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Image as ImageIcon,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import { LocationAutocompleteInput } from './LocationAutocompleteInput';
import type { LocationData } from './LocationAutocompleteInput';

interface ReportFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export function ReportForm({ onSuccess, onCancel }: ReportFormProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const routerLocation = useLocation();
  const {
    userLocation,
    isLoadingLocation,
    locationError: contextLocationError,
    refetchLocation,
  } = useUserLocation();
  const [step, setStep] = useState(1);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const [locationData, setLocationData] = useState<LocationData | null>(null);
  const [locationError, setLocationError] = useState('');
  const [useAutoLocation, setUseAutoLocation] = useState(true);

  useEffect(() => {
    if (userLocation && useAutoLocation) {
      setLocationData({
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        address: userLocation.address,
        formatted_address: userLocation.formatted_address,
      });
      setLocationError('');
    } else if (
      !useAutoLocation &&
      userLocation &&
      locationData &&
      locationData.latitude === userLocation.latitude
    ) {
      setLocationData(null);
    }
  }, [userLocation, useAutoLocation]);

  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<any | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleLocationSelect = (location: LocationData) => {
    setLocationData(location);
    setLocationError('');
  };

  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  const validateImage = async (imgFile: File) => {
    setIsValidating(true);
    setValidationError(null);
    setValidationResult(null);
    try {
      const base64 = await convertToBase64(imgFile);
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      const response = await fetch(`${API_URL}/api/validate-photo`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: base64,
          title,
          description,
        }),
      });

      if (!response.ok) {
        throw new Error('Validation request failed');
      }

      const result = await response.json();
      setValidationResult(result);
      if (result.status === 'REJECTED') {
        toast.error('Image Rejected', {
          description:
            result.recommendation?.userMessage ||
            'Image does not match reported issue or may be manipulated.',
        });
      } else if (result.status === 'FLAGGED_FOR_REVIEW') {
        toast.warning('Image Flagged for Review', {
          description:
            result.recommendation?.userMessage || 'Image will be manually reviewed by our team.',
        });
      } else {
        toast.success('Image Verified', {
          description: 'The photo matches the description and appears authentic!',
        });
      }
    } catch (err: any) {
      console.error(err);
      setValidationError(err.message || 'Failed to validate photo');
      toast.error('Photo validation failed to complete. Please try again.');
    } finally {
      setIsValidating(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
      const url = URL.createObjectURL(selected);
      setPreviewUrl(url);
      validateImage(selected);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const dropped = e.dataTransfer.files?.[0];
    if (dropped && dropped.type.startsWith('image/')) {
      setFile(dropped);
      setPreviewUrl(URL.createObjectURL(dropped));
      validateImage(dropped);
    }
  };

  const nextStep = () => {
    if (step === 2) {
      if (isValidating) {
        toast.info('Please wait for photo validation to complete.');
        return;
      }
      if (file && validationResult?.status === 'REJECTED') {
        toast.error('Cannot proceed. The uploaded photo has been rejected.', {
          description:
            validationResult.recommendation?.userMessage || 'Please upload a valid photo.',
        });
        return;
      }
    }
    setStep((s) => Math.min(s + 1, 3));
  };
  const prevStep = () => setStep((s) => Math.max(s - 1, 1));

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

        const { data } = supabase.storage.from('report-photos').getPublicUrl(filePath);

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
        user_id: user.id,
        photo_validation: validationResult,
      };

      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      const response = await fetch(`${API_URL}/api/reports`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reportData),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Failed to save report');
      }

      const newReport = await response.json();

      toast.success('Issue Reported Successfully!', {
        description: 'Your report will appear on the feed shortly.',
        icon: <CheckCircle2 className="w-5 h-5 text-green-500" />,
      });
      onSuccess();

      if (routerLocation.pathname !== '/social-feed') {
        navigate('/social-feed');
      }

      window.dispatchEvent(new Event('reportSubmitted'));

      setTimeout(() => {
        const feedContainer = document.querySelector('.custom-scrollbar');
        if (feedContainer) {
          feedContainer.scrollTo({ top: 0, behavior: 'smooth' });
        }

        const newReportCard = document.querySelector(`[data-report-id="${newReport.id}"]`);
        if (newReportCard) {
          newReportCard.classList.add('highlight-animation');
          setTimeout(() => {
            newReportCard.classList.remove('highlight-animation');
          }, 2000);
        }
      }, 500);
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
            { num: 3, label: 'Location', icon: MapPin },
          ].map((s, i) => (
            <div key={s.num} className="flex flex-col items-center relative z-10">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300
                ${
                  step === s.num
                    ? 'border-[var(--orange-primary)] bg-[var(--orange-primary)]/20 text-[var(--orange-primary)] shadow-[0_0_15px_rgba(255,107,53,0.3)]'
                    : step > s.num
                      ? 'border-[var(--orange-primary)] bg-[var(--orange-primary)] text-white'
                      : 'border-[var(--border-subtle)] bg-[var(--bg-elevated)] text-[var(--text-muted)]'
                }`}
              >
                {step > s.num ? (
                  <CheckCircle2 className="w-5 h-5" />
                ) : (
                  <s.icon className="w-5 h-5" />
                )}
              </div>
              <span
                className={`text-xs mt-2 font-medium ${step >= s.num ? 'text-white' : 'text-[var(--text-muted)]'}`}
              >
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
                <label className="text-sm font-medium text-[var(--text-secondary)] mb-2 block">
                  Issue Title
                </label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="bg-[var(--bg-secondary)] border-[var(--border-subtle)] text-white focus-visible:ring-[var(--orange-primary)] h-12"
                  placeholder="e.g., Massive pothole on 5th Avenue"
                  autoFocus
                />
              </div>
              <div>
                <label className="text-sm font-medium text-[var(--text-secondary)] mb-2 block">
                  Detailed Description
                </label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
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
              className="h-full flex flex-col space-y-4 overflow-y-auto custom-scrollbar pr-1"
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
              />

              {!previewUrl ? (
                <div
                  className="flex-1 min-h-[250px] border-2 border-dashed border-[var(--border-subtle)] rounded-xl flex flex-col items-center justify-center p-6 hover:border-[var(--orange-primary)]/50 hover:bg-[var(--bg-elevated)] transition-all duration-200 cursor-pointer text-center"
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <div className="w-16 h-16 rounded-full bg-[var(--bg-secondary)] flex items-center justify-center mx-auto mb-4">
                    <UploadCloud className="w-8 h-8 text-[var(--orange-primary)] animate-bounce" />
                  </div>
                  <h3 className="text-lg font-medium text-white mb-1">Upload Photo Evidence</h3>
                  <p className="text-[var(--text-muted)] text-sm mb-4">
                    Drag and drop or click to browse
                  </p>
                  <p className="text-xs text-[var(--text-disabled)]">
                    Supports: JPG, PNG (Max 5MB)
                  </p>
                </div>
              ) : (
                <div className="flex flex-col space-y-4">
                  {/* Photo Preview Card */}
                  <div className="relative aspect-[16/9] rounded-xl overflow-hidden border border-[var(--border-subtle)] bg-[var(--bg-secondary)] group">
                    <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-xs">
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={() => fileInputRef.current?.click()}
                        className="bg-white/10 text-white hover:bg-white/20 border border-white/20"
                      >
                        <RefreshCw className="w-4 h-4 mr-2" /> Change Photo
                      </Button>
                    </div>
                    <div className="absolute bottom-3 left-3 bg-black/60 px-3 py-1.5 rounded-lg border border-white/10 text-xs text-white/90 backdrop-blur-md">
                      Uploaded Evidence
                    </div>
                  </div>

                  {/* Validation Status section */}
                  {isValidating && (
                    <div className="p-5 bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-xl relative overflow-hidden backdrop-blur-md">
                      <div className="absolute inset-0 bg-gradient-to-r from-[var(--orange-primary)]/5 via-transparent to-transparent pointer-events-none animate-pulse" />
                      <div className="flex items-center space-x-3 mb-4">
                        <Loader2 className="w-5 h-5 animate-spin text-[var(--orange-primary)]" />
                        <h4 className="text-sm font-semibold text-white">
                          Running AI & Authenticity Verification...
                        </h4>
                      </div>
                      <div className="space-y-3 text-xs text-[var(--text-secondary)]">
                        <div className="flex items-center space-x-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-[var(--orange-primary)] animate-ping" />
                          <span>Reading EXIF tag parameters...</span>
                        </div>
                        <div className="flex items-center space-x-2 opacity-60">
                          <span className="w-1.5 h-1.5 rounded-full bg-neutral-600" />
                          <span>Analyzing pixels compression & edges...</span>
                        </div>
                        <div className="flex items-center space-x-2 opacity-40">
                          <span className="w-1.5 h-1.5 rounded-full bg-neutral-600" />
                          <span>Verifying content matches reported description...</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {validationError && (
                    <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl text-xs">
                      <div className="flex items-center justify-between text-rose-400 font-medium mb-1">
                        <span>Verification Error</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => file && validateImage(file)}
                          className="h-7 text-xs text-[var(--orange-primary)] hover:text-white px-2 py-0"
                        >
                          Retry Verification
                        </Button>
                      </div>
                      <p className="text-[var(--text-secondary)]">{validationError}</p>
                    </div>
                  )}

                  {validationResult && (
                    <div className="border border-[var(--border-subtle)] bg-[var(--bg-secondary)] rounded-xl overflow-hidden">
                      {/* Status Header */}
                      <div
                        className={`p-4 flex items-center justify-between border-b border-[var(--border-subtle)]
                        ${
                          validationResult.status === 'VERIFIED'
                            ? 'bg-emerald-500/5'
                            : validationResult.status === 'REJECTED'
                              ? 'bg-rose-500/5'
                              : 'bg-amber-500/5'
                        }
                      `}
                      >
                        <div className="flex items-center space-x-2">
                          {validationResult.status === 'VERIFIED' ? (
                            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]" />
                          ) : validationResult.status === 'REJECTED' ? (
                            <div className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-[0_0_8px_#ef4444]" />
                          ) : (
                            <div className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-[0_0_8px_#f59e0b]" />
                          )}
                          <span className="text-sm font-semibold text-white">
                            {validationResult.status === 'VERIFIED' && 'Verified Authentic'}
                            {validationResult.status === 'FLAGGED_FOR_REVIEW' &&
                              'Flagged for Review'}
                            {validationResult.status === 'REJECTED' && 'Photo Rejected'}
                          </span>
                        </div>
                        <span
                          className={`text-xs px-2.5 py-1 rounded-full font-bold
                          ${
                            validationResult.status === 'VERIFIED'
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : validationResult.status === 'REJECTED'
                                ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                                : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          }
                        `}
                        >
                          {validationResult.overallConfidence}% Confidence
                        </span>
                      </div>

                      <div className="p-4 space-y-4">
                        {/* Recommendation description */}
                        <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                          {validationResult.recommendation?.userMessage}
                        </p>

                        {/* Confidence indicator bar */}
                        <div className="w-full bg-[var(--bg-elevated)] h-1.5 rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all duration-1000
                              ${
                                validationResult.status === 'VERIFIED'
                                  ? 'bg-gradient-to-r from-emerald-600 to-emerald-400'
                                  : validationResult.status === 'REJECTED'
                                    ? 'bg-gradient-to-r from-rose-600 to-rose-400'
                                    : 'bg-gradient-to-r from-amber-600 to-amber-400'
                              }
                            `}
                            style={{ width: `${validationResult.overallConfidence}%` }}
                          />
                        </div>

                        {/* Analysis Sub-Layers */}
                        <div className="grid grid-cols-2 gap-3 pt-2 border-t border-[var(--border-subtle)] text-[11px]">
                          {/* contentMatch details */}
                          <div className="bg-[var(--bg-elevated)]/40 p-2.5 rounded-lg border border-[var(--border-subtle)]">
                            <span className="text-[var(--text-muted)] block mb-1">
                              Content Matching
                            </span>
                            <span className="text-white font-medium block truncate">
                              {validationResult.validations?.contentMatch?.details
                                ?.imageDescription || 'Analyzing content...'}
                            </span>
                            <span className="text-neutral-500 text-[10px] block mt-0.5">
                              Match: {validationResult.validations?.contentMatch?.confidence}%
                            </span>
                          </div>

                          {/* issueClassification */}
                          <div className="bg-[var(--bg-elevated)]/40 p-2.5 rounded-lg border border-[var(--border-subtle)]">
                            <span className="text-[var(--text-muted)] block mb-1">
                              Issue Category
                            </span>
                            <span className="text-white font-medium block capitalize">
                              {validationResult.validations?.issueClassification?.details
                                ?.primaryCategory || 'Analyzing issue...'}
                            </span>
                            <span className="text-neutral-500 text-[10px] block mt-0.5">
                              Severity:{' '}
                              {validationResult.validations?.issueClassification?.details
                                ?.severity || 'unknown'}
                            </span>
                          </div>

                          {/* authenticityCheck */}
                          <div className="bg-[var(--bg-elevated)]/40 p-2.5 rounded-lg border border-[var(--border-subtle)]">
                            <span className="text-[var(--text-muted)] block mb-1">
                              Manipulation Check
                            </span>
                            <span className="text-white font-medium block">
                              {validationResult.validations?.authenticityCheck?.details
                                ?.explanation || 'Pixel integrity check'}
                            </span>
                            <span className="text-neutral-500 text-[10px] block mt-0.5">
                              Integrity:{' '}
                              {validationResult.validations?.authenticityCheck?.confidence}%
                            </span>
                          </div>

                          {/* metadataValidation */}
                          <div className="bg-[var(--bg-elevated)]/40 p-2.5 rounded-lg border border-[var(--border-subtle)]">
                            <span className="text-[var(--text-muted)] block mb-1">
                              Metadata Check
                            </span>
                            <span className="text-white font-medium block truncate">
                              {validationResult.validations?.metadataValidation?.details?.exifData
                                ?.Model
                                ? `${validationResult.validations.metadataValidation.details.exifData.Make || ''} ${validationResult.validations.metadataValidation.details.exifData.Model}`
                                : 'No EXIF metadata found'}
                            </span>
                            <span className="text-neutral-500 text-[10px] block mt-0.5">
                              Score: {validationResult.validations?.metadataValidation?.confidence}%
                            </span>
                          </div>
                        </div>

                        {/* Warnings display */}
                        {validationResult.warnings && validationResult.warnings.length > 0 && (
                          <div className="p-3 bg-amber-500/5 border border-amber-500/20 rounded-lg text-[11px] text-amber-400 space-y-1">
                            <span className="font-semibold block">Validation Warnings:</span>
                            <ul className="list-disc list-inside space-y-0.5">
                              {validationResult.warnings.map((w: string, idx: number) => (
                                <li key={idx}>{w}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
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
              {/* Auto-Location Card */}
              <div className="bg-[var(--bg-secondary)] rounded-lg p-4 border border-[var(--border-subtle)] mb-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <MapPin className="w-5 h-5 text-[var(--orange-primary)]" />
                      <span className="font-medium text-white">Auto-Detected Location</span>
                      {isLoadingLocation && (
                        <Loader2 className="w-4 h-4 animate-spin text-[var(--orange-primary)]" />
                      )}
                    </div>

                    {contextLocationError ? (
                      <div className="text-red-500 text-sm mb-2">{contextLocationError}</div>
                    ) : userLocation ? (
                      <div className="text-sm text-[var(--text-secondary)]">
                        <p className="font-medium text-white mb-1">
                          {userLocation.formatted_address}
                        </p>
                        <p className="text-xs">
                          {userLocation.latitude.toFixed(6)}, {userLocation.longitude.toFixed(6)}
                        </p>
                      </div>
                    ) : (
                      <p className="text-sm text-[var(--text-secondary)]">Detecting location...</p>
                    )}
                  </div>

                  {contextLocationError && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={refetchLocation}
                      className="text-[var(--orange-primary)] hover:text-[var(--orange-hover)]"
                    >
                      <RefreshCw className="w-4 h-4 mr-1" />
                      Retry
                    </Button>
                  )}
                </div>

                <div className="flex items-center justify-between mt-3 pt-3 border-t border-[var(--border-subtle)]">
                  <label className="flex items-center gap-2 text-sm text-[var(--text-secondary)] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={useAutoLocation}
                      onChange={(e) => setUseAutoLocation(e.target.checked)}
                      disabled={!userLocation}
                      className="w-4 h-4 rounded border-[var(--border-subtle)] text-[var(--orange-primary)] 
                               focus:ring-[var(--orange-primary)] focus:ring-offset-0 bg-[var(--bg-elevated)]"
                    />
                    Use this location
                  </label>
                </div>
              </div>

              {!useAutoLocation && (
                <div>
                  <p className="text-sm text-[var(--text-secondary)] mb-3">
                    Enter a different location:
                  </p>
                  <LocationAutocompleteInput
                    onLocationSelect={handleLocationSelect}
                    error={locationError}
                  />
                </div>
              )}

              {(useAutoLocation && userLocation) || (!useAutoLocation && locationData) ? (
                <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3 mt-4">
                  <div className="flex items-center gap-2 text-green-500 text-sm">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Location confirmed and ready to submit</span>
                  </div>
                </div>
              ) : null}

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
          {step === 1 ? (
            'Cancel'
          ) : (
            <>
              <ArrowLeft className="w-4 h-4 mr-2" /> Back
            </>
          )}
        </Button>

        {step < 3 ? (
          <Button
            type="button"
            onClick={nextStep}
            disabled={
              (step === 1 && (!title || !description)) ||
              (step === 2 &&
                file !== null &&
                (isValidating || validationResult?.status === 'REJECTED'))
            }
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
