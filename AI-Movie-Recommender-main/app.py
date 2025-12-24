import streamlit as st
import requests
import openai  # For chatbot integration
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import random
import base64


# TMDB API Key (Replace with your own)
API_KEY = st.secrets["TMDB_API_KEY"]
OPENAI_API_KEY = st.secrets["OPENAI_API_KEY"]
openai.api_key = OPENAI_API_KEY  # Initialize OpenAI API

def fetch_movies(api_key, genre_id=None, language=None, is_trending=False):
    """Fetch movies based on filters or trending/popular movies."""
    
    if is_trending:
        url = f"https://api.themoviedb.org/3/movie/popular?api_key={api_key}&language=en-US&page=1"
    else:
        url = f"https://api.themoviedb.org/3/discover/movie?api_key={api_key}&language=en-US"
        if genre_id:
            url += f"&with_genres={genre_id}"
        if language:
            url += f"&with_original_language={language}"
    
    response = requests.get(url)
    return response.json().get("results", [])

def get_imdb_link(movie_id, api_key):
    
    #Fetch IMDb ID for a given TMDB movie ID and return the IMDb URL.
    #If no IMDb ID is found, return None.

    url = f"https://api.themoviedb.org/3/movie/{movie_id}/external_ids?api_key={api_key}"
    response = requests.get(url).json()
    imdb_id = response.get("imdb_id")
    if imdb_id:
        return f"https://www.imdb.com/title/{imdb_id}/"
    return None

def recommend_movies(movies, preferences, num_choices=5):

    #Recommend a movie based on the user's preferences using TF-IDF similarity.

    #- If no movies are found, return None.
    #- If no descriptions exist, pick a random movie.
   # - Use TF-IDF to compare the movie overviews and find the closest match.

    if not movies:
        return None  # Avoid errors if no movies match

    # Extract movie overviews for comparison
    overviews = [movie["overview"] for movie in movies if movie.get("overview")]

    if not overviews:
        return random.choice(movies)  # Fallback to random if no descriptions exist

    # Use TF-IDF to find best matches
    vectorizer = TfidfVectorizer(stop_words="english")
    tfidf_matrix = vectorizer.fit_transform(overviews)
    user_tfidf = vectorizer.transform([preferences])
    cosine_sim = cosine_similarity(user_tfidf, tfidf_matrix).flatten()

    # Get top N recommendations
    top_indices = cosine_sim.argsort()[-num_choices:][::-1]
    selected_index = random.choice(top_indices)  # Pick one from the best matches

    return movies[selected_index]

# Function to get chatbot response using OpenAI's updated API
def get_chatbot_response(user_input):
    client = openai.OpenAI(api_key=OPENAI_API_KEY)  # ✅ Pass API key explicitly
    
    response = client.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=[
            {"role": "system", "content": "You are a helpful AI movie assistant."},
            {"role": "user", "content": user_input}
        ]
    )
    
    return response.choices[0].message.content


GENRE_IDS = {
    "Action": 28, "Adventure": 12, "Animation": 16, "Comedy": 35, "Crime": 80,
    "Documentary": 99, "Drama": 18, "Family": 10751, "Fantasy": 14, "History": 36,
    "Horror": 27, "Music": 10402, "Mystery": 9648, "Romance": 10749, "Science Fiction": 878,
    "Thriller": 53, "War": 10752, "Western": 37
}

# Streamlit app
def main():
    st.title("🎬 AI-Powered Movie Recommender")
    # Language mapping (Full name → TMDB code)
    LANGUAGE_CODES = {
        "English": "en",
        "Español": "es",
        "French": "fr",
        "Deutsch": "de",
        "Simplified Chinese": "zh",
        "Japanese": "ja",
        "Hindi": "hi"
    }

    if "trending_index" not in st.session_state:
        st.session_state.trending_index = 0

    if "chat_history" not in st.session_state:
        st.session_state.chat_history = []

    st.header("💬 Movie Chatbot")

    # Chatbot UI
    user_input = st.text_input("Ask me anything about movies:", key="chat_input")
    if user_input:
        chatbot_response = get_chatbot_response(user_input)
        st.session_state.chat_history.append(("You", user_input))
        st.session_state.chat_history.append(("Chatbot", chatbot_response))
    
    # Keep only the last 5 messages in chat history
    st.session_state.chat_history = st.session_state.chat_history[-5:]
    
    # Display chat history in a scrollable container
    with st.expander("📜 Chat History (Click to Expand)", expanded=False):
        for speaker, message in st.session_state.chat_history:
            with st.chat_message(speaker):
                st.write(message)

    # 🔥 Top Trending Movies Section
    st.header("🔥 Top Trending Movies")
    
    trending_movies = fetch_movies(API_KEY, is_trending=True)
    if trending_movies:
        cols = st.columns([2, 5, 5, 5, 5, 5, 1])  # Arrows for navigation

        with cols[0]:  # Left Arrow
            if st.button("⬅", key="trending_left"):
                st.session_state.trending_index = (st.session_state.trending_index - 1) % len(trending_movies)
                st.rerun()

        start_idx = st.session_state.get("trending_index", 0)
        for idx, col in enumerate(cols[1:6]):
            movie = trending_movies[(start_idx + idx) % len(trending_movies)]
            imdb_url = get_imdb_link(movie.get('id'), API_KEY)
            with col:
                st.image(f"https://image.tmdb.org/t/p/w300{movie['poster_path']}", use_container_width=True)
                if imdb_url:
                    st.markdown(f"[**{movie['title']}**]({imdb_url})", unsafe_allow_html=True)
                else:
                    st.caption(movie["title"])

        with cols[6]:  # Right Arrow
            if st.button("➡", key="trending_right"):
                st.session_state.trending_index = (st.session_state.trending_index + 1) % len(trending_movies)
                st.rerun()

    # 🎭 User Preferences Form
    st.header("🎭 Tell us about your movie preferences:")
    with st.form(key="preferences_form"):
        genre = st.selectbox("Preferred Genre", list(GENRE_IDS.keys()), key="genre")
        
        # ✅ Use full language names, but map to TMDB codes
        selected_language = st.selectbox("Preferred Language", list(LANGUAGE_CODES.keys()), key="language")
        language_code = LANGUAGE_CODES[selected_language]  # Convert to TMDB language code
        
        mood = st.selectbox("Preferred Mood", ["Any", "Light-hearted", "Intense", "Inspirational", "Dark"], key="mood")
        length = st.slider("Preferred Movie Length (minutes)", 80, 180, (90, 120), key="length")
        release_year = st.slider("Preferred Release Year", 1980, 2025, (2000, 2025), key="release_year")
        content = st.selectbox("Content Considerations", ["No Preference", "Family-friendly", "Mature"], key="content")
        submit_button = st.form_submit_button(label="Submit")

    # ✅ Apply Filters Before Recommending
    if submit_button or st.session_state.get("recommendation"):
        genre_id = GENRE_IDS.get(genre)
        filtered_movies = fetch_movies(API_KEY, genre_id=genre_id, language=language_code)

        if filtered_movies:
            preferences = f"{genre} {selected_language} {mood} {length} {release_year} {content}"
            st.session_state.recommendation = recommend_movies(filtered_movies, preferences)
        else:
            st.warning("No movies found matching your preferences. Try different options.")

    # 🎬 Show recommended movie
    if st.session_state.get("recommendation"):
        movie = st.session_state.recommendation
        with st.expander("🎬 Recommended Movie"):
            cols = st.columns([3, 2])  # Title + Overview | Poster
            imdb_url = get_imdb_link(movie.get('id'), API_KEY)
            with cols[0]:
                if imdb_url:
                    st.subheader(f"[**{movie['title']}**]({imdb_url})")
                else:
                    st.subheader(f"**{movie['title']}**")
                st.write(movie["overview"])
            with cols[1]:
                st.image(f"https://image.tmdb.org/t/p/w300{movie['poster_path']}", use_container_width=True)

            if st.button("🔄 Recommend Another Movie"):
                st.session_state.recommendation = recommend_movies(filtered_movies, preferences)
                st.rerun()
            if st.button("🔍 New Search"):
                st.session_state.recommendation = None
                st.session_state.movies = None
                st.rerun()

    # 📌 Movies by Genre Section
    with st.expander("📌 Top Movies by Genre"):
        st.subheader("🎭 Movies by Genre")
        genre_movies = {genre: fetch_movies(API_KEY, genre_id=genre_id)[:5] for genre, genre_id in GENRE_IDS.items()}
        for genre_name, movies in genre_movies.items():
            st.write(f"**{genre_name}**")
            movie_cols = st.columns(5)
            for idx, movie in enumerate(movies):
                with movie_cols[idx]:
                    st.image(f"https://image.tmdb.org/t/p/w300{movie['poster_path']}", use_container_width=True)
                    imdb_url = get_imdb_link(movie.get('id'), API_KEY)
                    if imdb_url:
                        st.subheader(f"[**{movie['title']}**]({imdb_url})")
                    else:
                        st.caption(movie["title"])
            st.markdown("---")

if __name__ == "__main__":
    main()
