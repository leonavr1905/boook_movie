const API_URL = 'https://6ab34045217e43658830cc57.mockapi.io/movies'

const normalizeMovie = (movie) => {
  const genreValue = Array.isArray(movie.genre)
    ? movie.genre[0] || 'Drama'
    : movie.genre || 'Drama'

  return {
    id: movie.id,
    title: movie.title,
    director: movie.director,
    genre: genreValue,
    releaseYear: Number(movie.release_year ?? movie.releaseYear ?? 2000),
    rating: Number(movie.rating ?? 0),
    description: movie.description,
    imageUrl: movie.image || movie.imageUrl || 'https://via.placeholder.com/600x900?text=Movie',
  }
}

const toApiMovie = (movie) => ({
  ...movie,
  image: movie.imageUrl || movie.image,
  release_year: Number(movie.releaseYear ?? movie.release_year ?? 2000),
  genre: Array.isArray(movie.genre) ? movie.genre : [movie.genre],
})

async function request(url, options = {}) {
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
    },
    ...options,
  })

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`)
  }

  if (response.status === 204) {
    return null
  }

  return response.json()
}

export const getMovies = async () => {
  const data = await request(API_URL)
  return Array.isArray(data) ? data.map(normalizeMovie) : []
}

export const createMovie = async (movie) => {
  const created = await request(API_URL, {
    method: 'POST',
    body: JSON.stringify(toApiMovie(movie)),
  })
  return normalizeMovie(created)
}

export const updateMovie = async (movieId, movie) => {
  const updated = await request(`${API_URL}/${movieId}`, {
    method: 'PUT',
    body: JSON.stringify(toApiMovie(movie)),
  })
  return normalizeMovie(updated)
}

export const deleteMovie = async (movieId) => {
  return request(`${API_URL}/${movieId}`, {
    method: 'DELETE',
  })
}
