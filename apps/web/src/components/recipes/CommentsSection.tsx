'use client';

import { useState, useEffect } from 'react';
import { MessageSquare, Send, ThumbsUp, Reply, Star, MoreHorizontal, Loader2, Lock, X } from 'lucide-react';
import Image from 'next/image';
import { api } from '@/lib/api-client';
import { Comment } from '@/lib/types';
import { toast } from 'sonner';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import Link from 'next/link';

export default function CommentsSection({ recipeId }: { recipeId: number }) {
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [text, setText] = useState('');
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [replyText, setReplyText] = useState('');

  const fetchComments = async () => {
    try {
      const data = await api.comments.list(recipeId);
      setComments(data);
    } catch (error) {
      console.error('Error fetching comments:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [recipeId]);

  const handleSubmit = async (e: React.FormEvent, parentId: number | null = null) => {
    e.preventDefault();
    const content = parentId ? replyText : text;
    if (!isAuthenticated) {
      toast.error('You must be signed in to comment.');
      return;
    }
    if (!content.trim()) return;

    setSubmitting(true);
    try {
      const response = await api.comments.create({
        text: content,
        rating: parentId ? undefined : (rating || undefined),
        recipeId,
        parentId: parentId || undefined
      });
      
      toast.success(parentId ? 'Reply submitted for approval!' : 'Comment submitted for approval!');
      
      // Optimistic update
      const newComment: Comment = {
        ...(response as any),
        user: {
          name: user?.name || 'You',
          avatar: user?.avatar
        },
        replies: []
      };

      if (parentId) {
        setComments(prev => prev.map(c => 
          c.id === parentId 
            ? { ...c, replies: [newComment, ...(c.replies || [])] } 
            : c
        ));
        setReplyText('');
        setReplyingTo(null);
      } else {
        setComments(prev => [newComment, ...prev]);
        setText('');
        setRating(0);
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to post.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleLike = async (id: number) => {
    try {
      await api.comments.like(id);
      setComments(prev => {
        const updateLikes = (list: Comment[]): Comment[] => 
          list.map(c => {
            if (c.id === id) return { ...c, likeCount: (c.likeCount || 0) + 1 };
            if (c.replies) return { ...c, replies: updateLikes(c.replies) };
            return c;
          });
        return updateLikes(prev);
      });
    } catch (error) {
      toast.error('Failed to like comment.');
    }
  };

  return (
    <section className="mt-16 pt-16 border-t border-white/5 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center justify-between mb-10">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
            <MessageSquare className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-white tracking-tighter leading-none">Community Feedback</h2>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">
              {comments.length} Discussion Threads
            </p>
          </div>
        </div>
        
        <div className="hidden sm:flex items-center gap-4 bg-white/[0.03] border border-white/5 rounded-2xl px-5 py-2.5">
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map(s => (
              <Star key={s} className="w-3.5 h-3.5 fill-primary text-primary" />
            ))}
          </div>
          <span className="text-xs font-black text-white tracking-tight">4.9 Average Rating</span>
        </div>
      </div>

      {/* Main Comment Form */}
      {isAuthenticated ? (
        <form onSubmit={(e) => handleSubmit(e)} className="bg-card/40 backdrop-blur-xl border border-white/5 rounded-[32px] p-8 mb-12 shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[100px] -mr-32 -mt-32 rounded-full group-hover:bg-primary/10 transition-colors" />
          
          <div className="flex items-center gap-4 mb-8 relative">
             <div className="w-12 h-12 rounded-xl overflow-hidden border border-white/10 shrink-0">
               <Image 
                src={user?.avatar || `https://ui-avatars.com/api/?name=${user?.name || 'U'}&background=random`} 
                alt={user?.name || 'User'} 
                width={48} 
                height={48} 
                className="object-cover" 
               />
             </div>
             <div>
               <h3 className="text-sm font-black text-white">Posting as {user?.name}</h3>
               <p className="text-[10px] text-muted-foreground font-medium">Your comment will be public after approval.</p>
             </div>
          </div>
          
          <div className="flex flex-col gap-6 relative">
            <div className="flex items-center gap-4">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">Your Rating:</span>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    type="button"
                    key={star}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => setRating(star)}
                    className="transition-transform active:scale-90"
                  >
                    <Star 
                      className={`w-6 h-6 transition-all ${
                        star <= (hoverRating || rating) 
                          ? 'fill-primary text-primary drop-shadow-[0_0_8px_rgba(245,158,11,0.5)] scale-110' 
                          : 'text-white/10'
                      }`} 
                    />
                  </button>
                ))}
              </div>
            </div>

            <div className="relative">
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Share your thoughts about this recipe... Did you make any changes?"
                required
                className="w-full bg-background/50 border border-white/5 rounded-[24px] px-6 py-5 text-sm text-white placeholder:text-muted-foreground/30 focus:outline-none focus:ring-1 focus:ring-primary/50 min-h-[120px] transition-all"
              />
            </div>

            <div className="flex items-center justify-end">
              <button 
                type="submit"
                disabled={submitting}
                className="bg-primary text-primary-foreground px-8 py-3.5 rounded-full font-black text-[10px] uppercase tracking-[0.2em] flex items-center gap-3 hover:bg-white hover:text-black transition-all shadow-xl shadow-primary/10 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Submitting...</span>
                  </>
                ) : (
                  <>
                    <span>Post Comment</span>
                    <Send className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      ) : (
        <div className="bg-card/40 backdrop-blur-xl border border-white/5 rounded-[32px] p-12 mb-12 shadow-2xl text-center relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[100px] -mr-32 -mt-32 rounded-full" />
          <div className="relative flex flex-col items-center gap-6">
            <div className="w-16 h-16 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center text-primary mb-2">
              <Lock className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-xl font-black text-white mb-2 tracking-tighter">Sign in to join the conversation</h3>
              <p className="text-sm text-muted-foreground max-w-sm mx-auto leading-relaxed">
                We value our community. Please sign in or create an account to share your reviews and thoughts.
              </p>
            </div>
            <div className="flex items-center gap-4 mt-2">
              <Link href="/login" className="px-10 py-4 bg-primary text-primary-foreground rounded-full font-black text-[10px] uppercase tracking-[0.2em] hover:bg-white hover:text-black transition-all shadow-xl shadow-primary/10">
                Sign In
              </Link>
              <Link href="/register" className="px-10 py-4 bg-white/5 border border-white/10 text-white rounded-full font-black text-[10px] uppercase tracking-[0.2em] hover:bg-white/10 transition-all">
                Create Account
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Comments List */}
      <div className="space-y-8">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-4">
             <Loader2 className="w-10 h-10 animate-spin text-primary" />
             <span className="text-[10px] font-black uppercase tracking-widest">Loading community thoughts...</span>
          </div>
        ) : comments.length === 0 ? (
          <div className="bg-white/[0.02] border border-dashed border-white/10 rounded-[32px] py-20 text-center">
            <p className="text-muted-foreground text-sm font-medium">No reviews yet. Be the first to share your experience!</p>
          </div>
        ) : (
          comments.map((comment) => (
            <CommentItem 
              key={comment.id} 
              comment={comment} 
              handleLike={handleLike} 
              replyingTo={replyingTo}
              setReplyingTo={setReplyingTo}
              replyText={replyText}
              setReplyText={setReplyText}
              handleSubmit={handleSubmit}
              submitting={submitting}
              isAuthenticated={isAuthenticated}
            />
          ))
        )}
      </div>
    </section>
  );
}

function CommentItem({ 
  comment, 
  handleLike, 
  replyingTo, 
  setReplyingTo, 
  replyText, 
  setReplyText, 
  handleSubmit,
  submitting,
  isAuthenticated,
  isReply = false 
}: any) {
  return (
    <div className={`group/comment ${isReply ? 'mt-8 pl-12 border-l-2 border-white/5 relative' : ''}`}>
      {isReply && <div className="absolute -left-[50px] top-6 w-8 h-[2px] bg-white/5" />}
      <div className="flex gap-6">
        <div className={`relative ${isReply ? 'w-10 h-10 rounded-2xl' : 'w-14 h-14 rounded-[20px]'} overflow-hidden bg-card border border-white/5 shrink-0 shadow-lg group-hover/comment:border-primary/30 transition-colors`}>
          <Image 
            src={comment.user?.avatar || `https://ui-avatars.com/api/?name=${comment.user?.name || 'U'}&background=random`} 
            alt={comment.user?.name || 'User'} 
            fill 
            className="object-cover" 
          />
        </div>
        
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h4 className={`${isReply ? 'text-[13px]' : 'text-[15px]'} font-black text-white tracking-tight`}>
                {comment.user?.name}
              </h4>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                  {new Date(comment.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
                {comment.status === 'PENDING' && (
                  <span className="px-1.5 py-0.5 bg-orange-500/10 text-orange-500 text-[8px] font-black uppercase tracking-widest rounded-md border border-orange-500/20">
                    Pending Approval
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              {!isReply && comment.rating && (
                <div className="flex items-center gap-0.5 bg-primary/10 px-2 py-1 rounded-lg border border-primary/20">
                  <Star className="w-3 h-3 fill-primary text-primary" />
                  <span className="text-[10px] font-black text-primary">{comment.rating}.0</span>
                </div>
              )}
              <button className="p-2 text-muted-foreground/30 hover:text-white transition-colors">
                <MoreHorizontal className="w-4 h-4" />
              </button>
            </div>
          </div>
          
          <p className={`${isReply ? 'text-[12px]' : 'text-[13px]'} text-muted-foreground leading-loose font-medium mb-4 group-hover/comment:text-white/80 transition-colors`}>
            {comment.text}
          </p>
          
          <div className="flex items-center gap-6">
            <button 
              onClick={() => handleLike(comment.id)}
              className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors group/action"
            >
              <ThumbsUp className={`w-3.5 h-3.5 group-hover/action:scale-110 transition-transform ${comment.likeCount > 0 ? 'fill-primary text-primary' : ''}`} /> 
              {comment.likeCount || 0} Likes
            </button>
            {!isReply && (
              <button 
                onClick={() => {
                  if (!isAuthenticated) {
                    toast.error('Sign in to reply');
                    return;
                  }
                  setReplyingTo(replyingTo === comment.id ? null : comment.id);
                }}
                className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors group/action"
              >
                <Reply className="w-3.5 h-3.5 group-hover/action:scale-110 transition-transform" /> Reply
              </button>
            )}
          </div>

          {/* Reply Form */}
          {replyingTo === comment.id && (
            <form onSubmit={(e) => handleSubmit(e, comment.id)} className="mt-6 flex flex-col gap-4 animate-in slide-in-from-top-2 duration-300">
               <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Write your reply..."
                required
                className="w-full bg-white/5 border border-white/5 rounded-2xl px-5 py-4 text-xs text-white focus:outline-none focus:ring-1 focus:ring-primary/50 min-h-[80px]"
              />
              <div className="flex justify-end gap-3">
                <button 
                  type="button"
                  onClick={() => setReplyingTo(null)}
                  className="px-6 py-2 rounded-full border border-white/10 text-[9px] font-black uppercase tracking-widest text-white hover:bg-white/5 transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2 rounded-full bg-primary text-primary-foreground text-[9px] font-black uppercase tracking-widest hover:bg-white hover:text-black transition-all disabled:opacity-50"
                >
                  Post Reply
                </button>
              </div>
            </form>
          )}

          {/* Render Replies */}
          {comment.replies && comment.replies.length > 0 && (
            <div className="space-y-0">
              {comment.replies.map((reply: any) => (
                <CommentItem 
                  key={reply.id} 
                  comment={reply} 
                  handleLike={handleLike} 
                  isReply={true} 
                  isAuthenticated={isAuthenticated}
                />
              ))}
            </div>
          )}
        </div>
      </div>
      {/* Divider */}
      {!isReply && <div className="h-px w-full bg-gradient-to-r from-transparent via-white/5 to-transparent my-10 group-last/comment:hidden" />}
    </div>
  );
}
