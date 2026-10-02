import { useEffect, useMemo, useState } from 'react'
import { createMovie, deleteMovie as deleteMovieApi, getMovies, updateMovie } from './mockApi'
import './App.css'

const genreOptions = ['All', 'Action', 'Animation', 'Comedy', 'Drama', 'Horror', 'Science Fiction']
const ratingOptions = ['Any rating', '>= 8.0', '>= 7.0', '>= 6.0']

const emptyForm = {
  title: '',
  director: '',
  genre: 'Action',
  releaseYear: '',
  rating: '',
  description: '',
  imageUrl: '',
}

function App() {
  const [movies, setMovies] = useState([])
  const [search, setSearch] = useState('')
  const [activeGenre, setActiveGenre] = useState('All')
  const [selectedRating, setSelectedRating] = useState('Any rating')
  const [modal, setModal] = useState({ type: null, movieId: null })
  const [formData, setFormData] = useState(emptyForm)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchMovies = async () => {
      setIsLoading(true)
      try {
        const data = await getMovies()
        setMovies(data)
      } finally {
        setIsLoading(false)
      }
    }

    fetchMovies()
  }, [])

  const filteredMovies = useMemo(() => {
    return movies.filter((movie) => {
      const searchText = `${movie.title} ${movie.director}`.toLowerCase()
      const matchesSearch = searchText.includes(search.toLowerCase())
      const matchesGenre = activeGenre === 'All' || movie.genre === activeGenre

      let matchesRating = true
      if (selectedRating === '>= 8.0') {
        matchesRating = movie.rating >= 8
      }
      if (selectedRating === '>= 7.0') {
        matchesRating = movie.rating >= 7
      }
      if (selectedRating === '>= 6.0') {
        matchesRating = movie.rating >= 6
      }

      return matchesSearch && matchesGenre && matchesRating
    })
  }, [movies, search, activeGenre, selectedRating])

  const openAddModal = () => {
    setFormData(emptyForm)
    setModal({ type: 'add', movieId: null })
  }

  const openDetails = (movie) => {
    setModal({ type: 'details', movieId: movie.id })
  }

  const openEdit = (movie) => {
    setFormData({
      title: movie.title,
      director: movie.director,
      genre: movie.genre,
      releaseYear: movie.releaseYear,
      rating: movie.rating,
      description: movie.description,
      imageUrl: movie.imageUrl,
    })
    setModal({ type: 'edit', movieId: movie.id })
  }

  const openDelete = (movieId) => {
    setModal({ type: 'delete', movieId })
  }

  const closeModal = () => {
    setModal({ type: null, movieId: null })
    setFormData(emptyForm)
  }

  const handleInputChange = (event) => {
    const { name, value } = event.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    const payload = {
      ...formData,
      releaseYear: Number(formData.releaseYear),
      rating: Number(formData.rating),
    }

    try {
      if (modal.type === 'add') {
        const createdMovie = await createMovie(payload)
        setMovies((prev) => [createdMovie, ...prev])
      }

      if (modal.type === 'edit') {
        const updatedMovie = await updateMovie(modal.movieId, payload)
        setMovies((prev) =>
          prev.map((movie) =>
            movie.id === modal.movieId ? updatedMovie : movie,
          ),
        )
      }
    } finally {
      closeModal()
    }
  }

  const handleDelete = async () => {
    try {
      await deleteMovieApi(modal.movieId)
      setMovies((prev) => prev.filter((movie) => movie.id !== modal.movieId))
    } finally {
      closeModal()
    }
  }

  const selectedMovie = movies.find((movie) => movie.id === modal.movieId)

  return (
    <div className="page-shell">
      <div className="movie-app">
        <header className="app-header">
          <div className="brand-wrap">
            <h1 className="brand">
              My <span>Movie</span> Shelf
            </h1>
            <p>Keep track of everything you&apos;ve watched and loved.</p>
          </div>

          <button type="button" className="primary-btn" onClick={openAddModal}>
            + Add movie
          </button>
        </header>

        <div className="toolbar">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title or director..."
            aria-label="Search movie"
          />

          <select value={selectedRating} onChange={(e) => setSelectedRating(e.target.value)}>
            {ratingOptions.map((rating) => (
              <option key={rating} value={rating}>
                {rating}
              </option>
            ))}
          </select>
        </div>

        <div className="genre-row">
          {genreOptions.map((genre) => (
            <button
              key={genre}
              type="button"
              className={genre === activeGenre ? 'genre-btn active' : 'genre-btn'}
              onClick={() => setActiveGenre(genre)}
            >
              {genre}
            </button>
          ))}
        </div>

        <main className="movie-grid">
          {isLoading ? (
            <div className="empty-state">
              <div className="spinner" aria-label="Loading movies" />
              <p>Loading movies...</p>
            </div>
          ) : filteredMovies.length === 0 ? (
            <div className="empty-state">
              <p>No movies found.</p>
            </div>
          ) : (
            filteredMovies.map((movie) => (
              <article key={movie.id} className="movie-card">
                <div className="poster-wrap">
                  <img src={movie.imageUrl} alt={movie.title} />
                  <span className="rating-badge">★{movie.rating.toFixed(1)}</span>
                </div>

                <div className="card-body">
                  <h2>{movie.title}</h2>
                  <div className="meta-row">
                    <span>{movie.director}</span>
                    <span>{movie.releaseYear}</span>
                  </div>
                  <div className="genre-pill">{movie.genre}</div>
                  <div className="card-actions">
                    <button type="button" className="mini-btn detail" onClick={() => openDetails(movie)}>
                      Details
                    </button>
                    <button type="button" className="mini-btn edit" onClick={() => openEdit(movie)}>
                      Edit
                    </button>
                    <button type="button" className="mini-btn delete" onClick={() => openDelete(movie.id)}>
                      Delete
                    </button>
                  </div>
                </div>
              </article>
            ))
          )}
        </main>
      </div>

      {modal.type && (
        <div className="modal-backdrop" onClick={closeModal}>
          <div className="modal-panel" onClick={(event) => event.stopPropagation()}>
            {modal.type === 'details' && selectedMovie && (
              <>
                <div className="modal-header">
                  <h3>{selectedMovie.title}</h3>
                  <button type="button" className="close-btn" onClick={closeModal}>
                    ×
                  </button>
                </div>
                <div className="details-layout">
                  <img src={selectedMovie.imageUrl} alt={selectedMovie.title} className="details-poster" />
                  <div className="details-info">
                    <p>
                      <strong>Director:</strong> {selectedMovie.director}
                    </p>
                    <p>
                      <strong>Genre:</strong> {selectedMovie.genre}
                    </p>
                    <p>
                      <strong>Release:</strong> {selectedMovie.releaseYear}
                    </p>
                    <p>
                      <strong>Rating:</strong> {selectedMovie.rating.toFixed(1)} / 10
                    </p>
                    <p className="description">{selectedMovie.description}</p>
                  </div>
                </div>
              </>
            )}

            {modal.type === 'delete' && selectedMovie && (
              <>
                <h3>Delete this movie?</h3>
                <p className="delete-text">
                  Are you sure you want to delete <strong>{selectedMovie.title}</strong>? This can&apos;t be undone.
                </p>
                <div className="modal-actions">
                  <button type="button" className="secondary-btn" onClick={closeModal}>
                    Cancel
                  </button>
                  <button type="button" className="danger-btn" onClick={handleDelete}>
                    Delete
                  </button>
                </div>
              </>
            )}

            {(modal.type === 'add' || modal.type === 'edit') && (
              <>
                <h3>{modal.type === 'add' ? 'Add a movie' : 'Edit movie'}</h3>
                <form onSubmit={handleSubmit} className="movie-form">
                  <div className="field">
                    <label htmlFor="title">Title</label>
                    <input
                      id="title"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="field">
                    <label htmlFor="director">Director</label>
                    <input
                      id="director"
                      name="director"
                      value={formData.director}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="two-col">
                    <div className="field">
                      <label htmlFor="genre">Genre</label>
                      <select id="genre" name="genre" value={formData.genre} onChange={handleInputChange}>
                        {genreOptions.filter((item) => item !== 'All').map((item) => (
                          <option key={item} value={item}>
                            {item}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="field">
                      <label htmlFor="releaseYear">Release year</label>
                      <input
                        id="releaseYear"
                        name="releaseYear"
                        type="number"
                        min="1900"
                        max="2100"
                        value={formData.releaseYear}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="field">
                    <label htmlFor="rating">Rating (0-10)</label>
                    <input
                      id="rating"
                      name="rating"
                      type="number"
                      step="0.1"
                      min="0"
                      max="10"
                      value={formData.rating}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="field">
                    <label htmlFor="description">Description</label>
                    <textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="field">
                    <label htmlFor="imageUrl">Image URL</label>
                    <input
                      id="imageUrl"
                      name="imageUrl"
                      type="url"
                      value={formData.imageUrl}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="modal-actions">
                    <button type="submit" className="primary-btn small">
                      {modal.type === 'add' ? 'Add movie' : 'Save changes'}
                    </button>
                    <button type="button" className="secondary-btn" onClick={closeModal}>
                      Cancel
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default App
