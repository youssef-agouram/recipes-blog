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

export default function CommentsSection({ recipeId, className }: { recipeId: number; className?: string }) {
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [text, setText] = useState('');
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [replyText, setReplyText] = useState('');

  // Calculate dynamic average rating based on comments that have a rating
  const ratedComments = comments.filter(c => c.rating && c.rating > 0);
  const averageRating = ratedComments.length > 0
    ? Number((ratedComments.reduce((acc, curr) => acc + (curr.rating || 0), 0) / ratedComments.length).toFixed(1))
    : 0;

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
    <section className={className || "animate-in fade-in slide-in-from-bottom-4 duration-700"}>
      <div className="flex items-center justify-between mb-4 md:mb-6">
        <div className="flex items-center gap-2 md:gap-3">
          <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl md:rounded-[14px] bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
            <MessageSquare className="w-4 h-4 md:w-5 md:h-5" />
          </div>
          <div>
            <h2 className="text-base md:text-lg font-black text-white tracking-tighter leading-none">Community Feedback</h2>
            <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mt-0.5">
              {comments.length} Discussion Threads
            </p>
          </div>
        </div>
        
        <div className="hidden sm:flex items-center gap-3.5 bg-white/[0.03] border border-white/5 rounded-xl px-3.5 py-1.5">
          <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map(s => {
              const ratingRound = Math.round(averageRating || 5);
              return (
                <Star 
                  key={s} 
                  className={`w-3 h-3 ${averageRating > 0 && s <= ratingRound ? 'fill-primary text-primary' : 'text-white/10'}`} 
                />
              );
            })}
          </div>
          <span className="text-[10px] font-black text-white tracking-tight">
            {averageRating > 0 ? `${averageRating.toFixed(1)} Average Rating` : 'No ratings yet'}
          </span>
        </div>
      </div>

      {/* Comment Form or slim sign-in prompt */}
      {isAuthenticated ? (
        <form onSubmit={(e) => handleSubmit(e)} className="bg-card/40 backdrop-blur-xl border border-white/5 rounded-xl p-3 md:p-3.5 mb-4 shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[100px] -mr-32 -mt-32 rounded-full group-hover:bg-primary/10 transition-colors" />
          
          <div className="flex items-center gap-3 mb-2.5 relative">
             <div className="w-8 h-8 rounded-lg overflow-hidden border border-white/10 shrink-0">
               <Image 
                src={user?.avatar || `https://ui-avatars.com/api/?name=${user?.name || 'U'}&background=random`} 
                alt={user?.name || 'User'} 
                width={32} 
                height={32} 
                className="object-cover" 
               />
             </div>
             <div>
               <h3 className="text-[11px] font-black text-white">Posting as {user?.name}</h3>
               <p className="text-[8px] text-muted-foreground font-medium">Your comment will be public after approval.</p>
             </div>
          </div>
          
          <div className="flex flex-col gap-2.5 relative">
            <div className="flex items-center gap-2">
              <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-[0.2em]">Your Rating:</span>
              <div className="flex items-center gap-0.5">
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
                      className={`w-4 h-4 transition-all ${
                        star <= (hoverRating || rating) 
                          ? 'fill-primary text-primary drop-shadow-[0_0_6px_rgba(245,158,11,0.5)] scale-110' 
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
                placeholder="Share your thoughts about this recipe..."
                required
                className="w-full bg-background/50 border border-white/5 rounded-xl px-3 py-2 text-xs text-white placeholder:text-muted-foreground/30 focus:outline-none focus:ring-1 focus:ring-primary/50 min-h-[48px] md:min-h-[56px] transition-all"
              />
            </div>

            <div className="flex items-center justify-end">
              <button 
                type="submit"
                disabled={submitting}
                className="bg-primary text-primary-foreground px-4.5 py-1.5 md:py-2 rounded-full font-black text-[9px] uppercase tracking-[0.2em] flex items-center gap-1.5 hover:bg-white hover:text-black transition-all shadow-xl shadow-primary/10 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-3 h-3 animate-spin" />
                    <span>Submitting...</span>
                  </>
                ) : (
                  <>
                    <span>Post Comment</span>
                    <Send className="w-3 h-3" />
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      ) : (
        /* Slim sign-in bar — not blocking */
        <div className="flex items-center justify-between gap-3 bg-white/[0.03] border border-white/8 rounded-xl px-3.5 py-2 mb-4">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Lock className="w-3 h-3 shrink-0" />
            <span className="text-[10px] font-medium">Sign in to leave a comment</span>
          </div>
          <Link
            href="/login"
            className="shrink-0 px-3 py-1 bg-primary text-primary-foreground rounded-lg font-black text-[8px] uppercase tracking-[0.15em] hover:bg-white hover:text-black transition-all active:scale-95"
          >
            Sign In
          </Link>
        </div>
      )}

      {/* Comments List */}
      <div className="space-y-5">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-4">
             <Loader2 className="w-10 h-10 animate-spin text-primary" />
             <span className="text-[10px] font-black uppercase tracking-widest">Loading community thoughts...</span>
          </div>
        ) : comments.length === 0 ? null : (
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
    <div className={`group/comment ${isReply ? 'mt-5 pl-8 border-l border-white/5 relative' : ''}`}>
      {isReply && <div className="absolute -left-[34px] top-5 w-[32px] h-[1px] bg-white/5" />}
      <div className="flex gap-4">
        <div className={`relative ${isReply ? 'w-8 h-8 rounded-xl' : 'w-10 h-10 rounded-[14px]'} overflow-hidden bg-card border border-white/5 shrink-0 shadow-lg group-hover/comment:border-primary/30 transition-colors`}>
          <Image 
            src={comment.user?.avatar || `https://ui-avatars.com/api/?name=${comment.user?.name || 'U'}&background=random`} 
            alt={comment.user?.name || 'User'} 
            fill 
            className="object-cover" 
          />
        </div>
        
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1.5">
            <div>
              <h4 className={`${isReply ? 'text-[11px]' : 'text-[13px]'} font-black text-white tracking-tight`}>
                {comment.user?.name}
              </h4>
              <div className="flex items-center gap-1.5">
                <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest">
                  {new Date(comment.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
                {comment.status === 'PENDING' && (
                  <span className="px-1 py-0.5 bg-orange-500/10 text-orange-500 text-[7px] font-black uppercase tracking-widest rounded-md border border-orange-500/20">
                    Pending
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              {!isReply && comment.rating && (
                <div className="flex items-center gap-0.5 bg-primary/10 px-1.5 py-0.5 rounded-md border border-primary/20">
                  <Star className="w-2.5 h-2.5 fill-primary text-primary" />
                  <span className="text-[9px] font-black text-primary">{comment.rating}.0</span>
                </div>
              )}
              <button className="p-1 text-muted-foreground/30 hover:text-white transition-colors">
                <MoreHorizontal className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
          
          <p className={`${isReply ? 'text-[11px]' : 'text-[12px]'} text-muted-foreground leading-relaxed font-medium mb-2 group-hover/comment:text-white/80 transition-colors`}>
            {comment.text}
          </p>
          
          <div className="flex items-center gap-4">
            <button 
              onClick={() => handleLike(comment.id)}
              className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors group/action"
            >
              <ThumbsUp className={`w-3 h-3 group-hover/action:scale-110 transition-transform ${comment.likeCount > 0 ? 'fill-primary text-primary' : ''}`} /> 
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
                className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors group/action"
              >
                <Reply className="w-3 h-3 group-hover/action:scale-110 transition-transform" /> Reply
              </button>
            )}
          </div>

          {/* Reply Form */}
          {replyingTo === comment.id && (
            <form onSubmit={(e) => handleSubmit(e, comment.id)} className="mt-4 flex flex-col gap-3 animate-in slide-in-from-top-2 duration-300">
               <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Write your reply..."
                required
                className="w-full bg-white/5 border border-white/5 rounded-xl px-3.5 py-2.5 text-[11px] text-white focus:outline-none focus:ring-1 focus:ring-primary/50 min-h-[55px]"
              />
              <div className="flex justify-end gap-2">
                <button 
                  type="button"
                  onClick={() => setReplyingTo(null)}
                  className="px-4 py-1.5 rounded-full border border-white/10 text-[8px] font-black uppercase tracking-widest text-white hover:bg-white/5 transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-1.5 rounded-full bg-primary text-primary-foreground text-[8px] font-black uppercase tracking-widest hover:bg-white hover:text-black transition-all disabled:opacity-50"
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
      {!isReply && <div className="h-px w-full bg-gradient-to-r from-transparent via-white/5 to-transparent my-6 group-last/comment:hidden" />}
    </div>
  );
}
