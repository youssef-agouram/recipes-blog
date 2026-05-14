'use client';

import { useState, useEffect } from 'react';
import { 
  MessageSquare, Shield, Bell, Users, 
  Save, RotateCcw, Loader2, CheckCircle2,
  AlertCircle, Info, ToggleLeft, ToggleRight
} from 'lucide-react';
import Link from 'next/link';
import { useGetSiteSettingsQuery, useUpdateSiteSettingsMutation } from '@/store/api/settingsApi';
import { toast } from 'sonner';

export default function CommentSettingsPage() {
  const { data: settings, isLoading } = useGetSiteSettingsQuery();
  const [updateSettings, { isLoading: isUpdating }] = useUpdateSiteSettingsMutation();

  const [formData, setFormData] = useState({
    autoApprove: false,
    allowGuest: true,
    showRatings: true,
    notifications: true,
    minCommentLength: 5,
    maxCommentLength: 1000,
    profanityFilter: true,
    blacklist: ''
  });

  useEffect(() => {
    if (settings?.commentSettings) {
      setFormData(prev => ({
        ...prev,
        ...settings.commentSettings
      }));
    }
  }, [settings]);

  const handleSave = async () => {
    try {
      const updatedSettings = {
        ...settings,
        commentSettings: formData
      };
      await updateSettings(updatedSettings).unwrap();
      toast.success('Comment settings updated successfully');
    } catch (error) {
      toast.error('Failed to update settings');
    }
  };

  const toggleField = (field: keyof typeof formData) => {
    if (typeof formData[field] === 'boolean') {
      setFormData(prev => ({ ...prev, [field]: !prev[field] }));
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
        <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Loading settings...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">Comment Settings</h1>
          <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground mt-1 uppercase tracking-widest">
            <Link href="/admin" className="hover:text-white transition-colors">Admin</Link>
            <span className="opacity-30">&gt;</span>
            <Link href="/admin/comments" className="hover:text-white transition-colors">Comments</Link>
            <span className="opacity-30">&gt;</span>
            <span className="text-white/60">Settings</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => window.location.reload()}
            className="flex items-center gap-2 px-5 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white text-sm font-bold rounded-xl transition-all"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset</span>
          </button>
          <button 
            onClick={handleSave}
            disabled={isUpdating}
            className="flex items-center gap-2 px-6 py-2.5 bg-primary hover:bg-primary/90 disabled:opacity-50 text-white text-sm font-bold rounded-xl transition-all shadow-lg shadow-primary/20 active:scale-95"
          >
            {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>Save Changes</span>
          </button>
        </div>
      </div>

      <div className="grid gap-8">
        {/* Moderation Section */}
        <section className="bg-card/40 backdrop-blur-xl border border-white/5 rounded-[32px] overflow-hidden shadow-2xl">
          <div className="p-8 border-b border-white/5 bg-gradient-to-r from-purple-500/10 to-transparent">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-500/20 rounded-2xl">
                <Shield className="w-6 h-6 text-purple-500" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Moderation & Approval</h2>
                <p className="text-sm text-muted-foreground">Control how comments are handled before they go live.</p>
              </div>
            </div>
          </div>
          
          <div className="p-8 space-y-8">
            <div className="flex items-center justify-between group cursor-pointer" onClick={() => toggleField('autoApprove')}>
              <div className="space-y-1">
                <h4 className="text-[15px] font-bold text-white group-hover:text-primary transition-colors">Auto-approve Comments</h4>
                <p className="text-xs text-muted-foreground max-w-[500px]">If enabled, comments will be published immediately without requiring manual review.</p>
              </div>
              {formData.autoApprove ? <ToggleRight className="w-10 h-10 text-primary" /> : <ToggleLeft className="w-10 h-10 text-muted-foreground/30" />}
            </div>

            <div className="flex items-center justify-between group cursor-pointer" onClick={() => toggleField('profanityFilter')}>
              <div className="space-y-1">
                <h4 className="text-[15px] font-bold text-white group-hover:text-primary transition-colors">Profanity Filter</h4>
                <p className="text-xs text-muted-foreground max-w-[500px]">Automatically flag or block comments containing offensive language.</p>
              </div>
              {formData.profanityFilter ? <ToggleRight className="w-10 h-10 text-primary" /> : <ToggleLeft className="w-10 h-10 text-muted-foreground/30" />}
            </div>

            <div className="space-y-3 pt-4 border-t border-white/5">
              <h4 className="text-[15px] font-bold text-white">Blacklisted Keywords</h4>
              <p className="text-xs text-muted-foreground mb-4">Add keywords (separated by commas) that will cause a comment to be marked as SPAM.</p>
              <textarea 
                className="w-full bg-background/50 border border-white/10 rounded-2xl p-4 text-sm text-white placeholder:text-muted-foreground/30 focus:outline-none focus:ring-1 focus:ring-primary transition-all h-32"
                placeholder="e.g. spam, win money, crypto, buy now..."
                value={formData.blacklist}
                onChange={(e) => setFormData(prev => ({ ...prev, blacklist: e.target.value }))}
              />
            </div>
          </div>
        </section>

        {/* Permissions Section */}
        <section className="bg-card/40 backdrop-blur-xl border border-white/5 rounded-[32px] overflow-hidden shadow-2xl">
          <div className="p-8 border-b border-white/5 bg-gradient-to-r from-blue-500/10 to-transparent">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-500/20 rounded-2xl">
                <Users className="w-6 h-6 text-blue-500" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">User Permissions</h2>
                <p className="text-sm text-muted-foreground">Manage who can interact with your recipes.</p>
              </div>
            </div>
          </div>
          
          <div className="p-8 space-y-8">
            <div className="flex items-center justify-between group cursor-pointer" onClick={() => toggleField('allowGuest')}>
              <div className="space-y-1">
                <h4 className="text-[15px] font-bold text-white group-hover:text-primary transition-colors">Allow Guest Comments</h4>
                <p className="text-xs text-muted-foreground max-w-[500px]">Enable non-registered users to leave comments by providing their name and email.</p>
              </div>
              {formData.allowGuest ? <ToggleRight className="w-10 h-10 text-primary" /> : <ToggleLeft className="w-10 h-10 text-muted-foreground/30" />}
            </div>

            <div className="flex items-center justify-between group cursor-pointer" onClick={() => toggleField('showRatings')}>
              <div className="space-y-1">
                <h4 className="text-[15px] font-bold text-white group-hover:text-primary transition-colors">Enable Star Ratings</h4>
                <p className="text-xs text-muted-foreground max-w-[500px]">Allow users to leave a 1-5 star rating along with their written feedback.</p>
              </div>
              {formData.showRatings ? <ToggleRight className="w-10 h-10 text-primary" /> : <ToggleLeft className="w-10 h-10 text-muted-foreground/30" />}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-white/5">
              <div className="space-y-2">
                <label className="text-[15px] font-bold text-white">Min Length</label>
                <input 
                  type="number"
                  className="w-full bg-background/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white"
                  value={formData.minCommentLength}
                  onChange={(e) => setFormData(prev => ({ ...prev, minCommentLength: Number(e.target.value) }))}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[15px] font-bold text-white">Max Length</label>
                <input 
                  type="number"
                  className="w-full bg-background/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white"
                  value={formData.maxCommentLength}
                  onChange={(e) => setFormData(prev => ({ ...prev, maxCommentLength: Number(e.target.value) }))}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Notifications Section */}
        <section className="bg-card/40 backdrop-blur-xl border border-white/5 rounded-[32px] overflow-hidden shadow-2xl">
          <div className="p-8 border-b border-white/5 bg-gradient-to-r from-orange-500/10 to-transparent">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-orange-500/20 rounded-2xl">
                <Bell className="w-6 h-6 text-orange-500" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Alerts & Notifications</h2>
                <p className="text-sm text-muted-foreground">Stay updated when new comments are posted.</p>
              </div>
            </div>
          </div>
          
          <div className="p-8">
            <div className="flex items-center justify-between group cursor-pointer" onClick={() => toggleField('notifications')}>
              <div className="space-y-1">
                <h4 className="text-[15px] font-bold text-white group-hover:text-primary transition-colors">Email Notifications</h4>
                <p className="text-xs text-muted-foreground max-w-[500px]">Send an email alert to site administrators when a new comment is submitted for review.</p>
              </div>
              {formData.notifications ? <ToggleRight className="w-10 h-10 text-primary" /> : <ToggleLeft className="w-10 h-10 text-muted-foreground/30" />}
            </div>
          </div>
        </section>
      </div>

      {/* Warning Info */}
      <div className="flex items-start gap-4 p-6 bg-blue-500/5 border border-blue-500/20 rounded-2xl">
        <Info className="w-6 h-6 text-blue-500 shrink-0" />
        <div className="space-y-1">
          <p className="text-sm font-bold text-white">Pro Tip: Balance is Key</p>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Allowing guest comments can increase engagement but may attract more spam. We recommend keeping the <strong>Auto-approve</strong> setting disabled if guests are allowed, so you can filter out low-quality content manually.
          </p>
        </div>
      </div>
    </div>
  );
}
