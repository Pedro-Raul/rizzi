import { useCallback, useEffect, useState } from 'react';
import { Star, MessageSquare } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { reviewService } from '../../services/review.service';

const ReviewSection = ({ businessId, onReviewAdded }) => {
  const { user, isAuthenticated } = useAuth();
  
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userReview, setUserReview] = useState(null);
  
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const fetchReviews = useCallback(async () => {
    setLoading(true);
    
    // Fetch all reviews for this business
    const { data } = await reviewService.getBusinessReviews(businessId);
    setReviews(Array.isArray(data) ? data : []);

    // Check if the current user has already reviewed
    if (isAuthenticated && user) {
      const { data: myReview } = await reviewService.getUserReview(businessId, user.id);
      if (myReview) {
        setUserReview(myReview);
        setRating(myReview.rating);
        setComment(myReview.comment || '');
      }
    }
    
    setLoading(false);
  }, [businessId, isAuthenticated, user]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchReviews();
  }, [fetchReviews]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) {
      alert('Por favor selecciona una calificación de estrellas.');
      return;
    }

    setSubmitting(true);
    
    let error;
    if (userReview) {
      const res = await reviewService.updateReview(userReview.id, rating, comment);
      error = res.error;
    } else {
      const res = await reviewService.createReview(businessId, user.id, rating, comment);
      error = res.error;
    }

    setSubmitting(false);

    if (error) {
      alert('Error al guardar la reseña: ' + error.message);
    } else {
      setShowForm(false);
      fetchReviews();
      if (onReviewAdded) onReviewAdded();
    }
  };

  const handleDelete = async () => {
    if (!userReview) return;
    if (!window.confirm('¿Seguro que deseas eliminar tu reseña?')) return;
    
    setSubmitting(true);
    const { error } = await reviewService.deleteReview(userReview.id);
    setSubmitting(false);
    
    if (error) {
      alert('Error al eliminar: ' + error.message);
    } else {
      setUserReview(null);
      setRating(0);
      setComment('');
      setShowForm(false);
      fetchReviews();
      if (onReviewAdded) onReviewAdded();
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mt-8">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-dark flex items-center gap-2">
          <MessageSquare className="text-primary" />
          Reseñas de la comunidad
        </h3>
        
        {isAuthenticated && !showForm && (
          <button 
            onClick={() => setShowForm(true)}
            className="text-sm font-medium text-primary hover:underline"
          >
            {userReview ? 'Editar mi reseña' : 'Dejar una reseña'}
          </button>
        )}
      </div>

      {!isAuthenticated && (
        <div className="bg-gray-50 rounded-lg p-4 mb-6 border border-gray-200 text-center text-sm text-gray-600">
          Inicia sesión para compartir tu experiencia con este negocio.
        </div>
      )}

      {showForm && isAuthenticated && (
        <form onSubmit={handleSubmit} className="bg-gray-50 p-5 rounded-xl border border-gray-200 mb-8">
          <h4 className="font-bold text-dark mb-3">
            {userReview ? 'Actualiza tu calificación' : '¿Cómo fue tu experiencia?'}
          </h4>
          
          <div className="flex items-center gap-2 mb-4">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                type="button"
                key={star}
                className="focus:outline-none transition-transform hover:scale-110"
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                onClick={() => setRating(star)}
              >
                <Star 
                  size={28} 
                  fill={(hoverRating || rating) >= star ? '#f59e0b' : 'none'} 
                  className={(hoverRating || rating) >= star ? 'text-amber-500' : 'text-gray-300'} 
                />
              </button>
            ))}
          </div>

          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Escribe tu opinión aquí... (Opcional)"
            rows="3"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all mb-4"
          />

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={submitting || rating === 0}
              className="bg-primary text-white font-medium py-2 px-6 rounded-lg hover:bg-opacity-90 transition-all disabled:opacity-50"
            >
              {submitting ? 'Guardando...' : 'Guardar reseña'}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="bg-white text-gray-700 font-medium py-2 px-4 rounded-lg border border-gray-300 hover:bg-gray-50 transition-all"
            >
              Cancelar
            </button>
            {userReview && (
              <button
                type="button"
                onClick={handleDelete}
                disabled={submitting}
                className="ml-auto text-red-500 hover:underline text-sm font-medium"
              >
                Eliminar reseña
              </button>
            )}
          </div>
        </form>
      )}

      {loading ? (
        <div className="flex justify-center py-6">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
        </div>
      ) : reviews.length > 0 ? (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div key={review.id} className="border-b border-gray-100 last:border-0 pb-4 last:pb-0">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-3">
                  {review.users?.avatar_url ? (
                    <img src={review.users.avatar_url} alt={review.users.full_name} className="w-10 h-10 rounded-full object-cover bg-gray-200" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">
                      {review.users?.full_name?.charAt(0)?.toUpperCase() || '?'}
                    </div>
                  )}
                  <div>
                    <h5 className="font-medium text-dark text-sm">{review.users?.full_name || 'Usuario'}</h5>
                    <div className="flex items-center gap-1 mt-0.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star 
                          key={star} 
                          size={12} 
                          fill={review.rating >= star ? '#f59e0b' : 'none'} 
                          className={review.rating >= star ? 'text-amber-500' : 'text-gray-300'} 
                        />
                      ))}
                    </div>
                  </div>
                </div>
                <span className="text-xs text-gray-400">
                  {new Date(review.updated_at).toLocaleDateString()}
                </span>
              </div>
              {review.comment && (
                <p className="text-gray-600 text-sm mt-2 ml-13 pl-13">
                  {review.comment}
                </p>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          Aún no hay reseñas. ¡Sé el primero en opinar!
        </div>
      )}
    </div>
  );
};

export default ReviewSection;
