/**
 * 1. Render songs
 * 2. Scroll top
 * 3. Play / pause / seek
 * 4. CD rotate
 * 5. Next / prev 
 * 6. Random
 * 7. Next / Repeat when ended
 * 8. Active song
 * 9. Scroll active song into view
 * 10. Play song when click
 */

const $ = document.querySelector.bind(document)
const $$ = document.querySelectorAll.bind(document)

const PLAYER_STORAGE_KEY = 'TIN_PLAYER'

const player = $('.player')
const cd = $('.cd')
const heading = $('header h2')
const cdThumb = $('.cd-thumb')
const audio = $('#audio')
const playBtn = $('.btn-toggle-play')
const progress = $('#progress')
const nextBtn = $('.btn-next')
const prevBtn = $('.btn-prev')
const randomBtn = $('.btn-random')
const repeatBtn = $('.btn-repeat')
const playList = $('.playlist')
const optionBtn = $('.option')
const optionList = $('.option-list')
const themeText = $('.theme-btn span')
const themeIcon = $('.theme-icon')

const favoriteModal = $('.favorite_songs-modal')
const favoriteList = $('.favorite_songs-list')
const emptyList = $('.empty-list')

let likedList = []

const app = {
    currentIndex: 0,
    isPlaying: false,
    isRandom: false,
    isRepeat: false,
    config: JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY)) || {},
    songs: [
        {
            name: "Cho Em An Toàn",
            singer: "HIEUTHUHAI",
            path: "assets/music/ChoEmAnToan.mp3",
            image: "assets/imgs/choemantoan.jpg"
        },
        {
            name: "ExitSign",
            singer: "HIEUTHUHAI",
            path: "assets/music/ExitSign.mp3",
            image: "assets/imgs/exitsign.jpg"
        },
        {
            name: "Không Phải Gu",
            singer: "HIEUTHUHAI",
            path: "assets/music/KhongPhaiGu.mp3",
            image: "assets/imgs/khongphaigu.jpg"
        },
        {
            name: "Không Thể Say",
            singer: "HIEUTHUHAI",
            path: "assets/music/KhongTheSay.mp3",
            image: "assets/imgs/khongthesay.jpg"
        },
        {
            name: "NOLOVENOLIFE",
            singer: "HIEUTHUHAI",
            path: "assets/music/NOLOVENOLIFE.mp3",
            image: "assets/imgs/nolovenolife.jpg"
        },
        {
            name: "Thuỷ Triều",
            singer: "HIEUTHUHAI",
            path: "assets/music/ThuyTrieu.mp3",
            image: "assets/imgs/thuytrieu.jpg"
        },
        {
            name: "Tràn Bộ Nhớ",
            singer: "Dương Domic",
            path: "assets/music/TranBoNho.mp3",
            image: "assets/imgs/tranbonho.jpg"
        }
    ],
    setConfig: function(key, value) {
        this.config[key] = value;
        localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(this.config))
    },
    render: function () {
        const html = this.songs.map((song, index) => {
            return `
            <div class="song-node">
                <div class="song ${index === this.currentIndex ? 'active' : ''}" data-index=${index}>
                    <div class="thumb" style="background-image: url('${song.image}')"></div> 
                    <div class="body">
                        <h3 class="title">${song.name}</h3>
                        <p class="author">${song.singer}</p>
                    </div>
                    <div class="favorite"> 
                        <i class="far fa-heart"></i>
                    </div>
                </div>
            </div>
        `
        })
        playList.innerHTML = html.join('')
    },
    defineProperties: function () {
        Object.defineProperty(this, 'currentSong', {
            get: function() {
                return this.songs[this.currentIndex]
            }
        })
    },
    handleEvents: function () {
        const _this = this
        const cdWidth = cd.offsetWidth

        // Xử lý CD quay / dừng
        const cdThumbAnimate = cdThumb.animate([
            { transform: 'rotate(360deg)' }
        ], {
            duration: 10000, // 10s
            iterations: Infinity // Lặp vô hạn
        })

        cdThumbAnimate.pause()

        // Xử lý phóng to / thu nhỏ CD
        document.onscroll = function () {
            const scrollTop = window.scrollY || document.documentElement.scrollTop
            const newCdWidth = cdWidth - scrollTop
            cd.style.width = newCdWidth > 0 ? newCdWidth + 'px' : 0
            cd.style.opacity = newCdWidth / cdWidth
        }

        // Xử lý khi click play
        playBtn.onclick = function () {
            if (_this.isPlaying) {
                audio.pause()
            } else {
                audio.play()
            }
        }

        // Khi bài hát được play
        audio.onplay = function () {
            _this.isPlaying = true
            player.classList.add('playing')
            cdThumbAnimate.play()
        }

        // Khi bài hát được pause
        audio.onpause = function() {
            _this.isPlaying = false
            player.classList.remove('playing')
            cdThumbAnimate.pause()
        }

        // Khi tiến độ bài hát thay đổi
        audio.ontimeupdate = function() {
            if (audio.duration) {
                const progressPercent = Math.floor(audio.currentTime / audio.duration * 100)
                progress.value = progressPercent
            }
        }
        
        // Xử lý khi tua bài hát
        progress.onchange = function(e) {
            const seekTime = audio.duration / 100 * e.target.value
            audio.currentTime = seekTime
        }

        // Khi next bài hát
        nextBtn.onclick = function() {
            if (_this.isRandom) {
                _this.playRandomSong()
            } else {
                _this.nextSong()
            }
            audio.play()
            _this.render()
            _this.scrollToActiveSong()
        }

        // Khi prev bài hát
        prevBtn.onclick = function() {
            if (_this.isRandom) {
                _this.playRandomSong()
            } else {
                _this.prevSong()
            }
            audio.play()
            _this.render()
        }

        // Khi random bài hát
        randomBtn.onclick = function() {
            _this.isRandom = !_this.isRandom
            _this.setConfig('isRandom', _this.isRandom)
            randomBtn.classList.toggle('active', _this.isRandom)
        }

        // Xử lý lặp lại 1 bài hát
        repeatBtn.onclick = function() {
            _this.isRepeat = !_this.isRepeat
            _this.setConfig('isRepeat', _this.isRepeat)
            repeatBtn.classList.toggle('active', _this.isRepeat)
        }

        // Xử lý next song khi audio end
        audio.onended = function() {
            if (_this.isRepeat) {
                audio.play()
            } else {
                nextBtn.click()
            }
        }

        // Show option list 
        optionBtn.onclick = function (e) {
            optionList.style.display = !Boolean(optionList.style.display) ? 'block' : null
        }
        optionList.onclick = function (e) {
            // Chuyển mode sáng tối
            if (e.target.closest('.theme-btn')) {
                themeIcon.classList.toggle('fa-sun')
                $('body').classList.toggle('dark')
                themeText.textContent = themeIcon.matches('.fa-sun') ? 'Light mode' : 'Dark mode'
                _this.setConfig('classDark', $('body').className)
                e.stopPropagation()
            } else {
                // Mở box favorite song
                favoriteModal.style.display = 'flex'
                $('body').style.overflow = 'hidden'
                emptyList.style.display = favoriteList.childElementCount > 0 ? 'none' : null
            }
        }

        // Xử lý bấm vào nút close và ra ngoài thì đóng favorite box
        favoriteModal.onclick = function(e) {
            if (e.target.matches('.favorite_songs-close') || e.target.matches('.favorite_songs-modal')) {
                favoriteModal.style.display = null
                $('body').style.overflow = null
            } else {
                playList.onclick(e)
            }
            emptyList.style.display = favoriteList.childElementCount > 0 ? 'none' : null
        }

        // Lắng nghe hành vi click vào bài hát trong playList
        playList.onclick = function(e) {
            const songNode = e.target.closest('.song:not(.active)')
            const favoriteIcon = e.target.closest('.favorite')
            if (songNode || favoriteIcon) {
                // Xử lý khi click vào bài hát
                if (!favoriteIcon) {
                    _this.currentIndex = Number(songNode.dataset.index)
                    _this.loadCurrentSong()
                    audio.play()
                }

                // Xử lý khi click vào yêu thích bài hát
                if (favoriteIcon) {
                    let favoriteSong = favoriteIcon.closest('.song')
                    _this.handleLikedList([favoriteSong.dataset.index])
                    _this.setConfig('likedListIndex', likedList)
                }
            }
        }
    },
    handleLikedList: function(favSongsIndex) {
        // Duyệt mảng vị trí các bài hát đã bấm tim, nếu like thì thêm vào favorite box
        // bỏ like thì xóa khỏi favorite box, áp dụng cho cả loadconfig 
        favSongsIndex.forEach(index => {
            let favoriteSong = $$(`.song[data-index="${index}"]`)
            if (!favoriteSong.length) return
            favoriteSong.forEach(song => {
                song.classList.toggle('liked')
                song.querySelector('i').classList.toggle('fas')
            })
            favoriteSong = favoriteSong[0]
            if (favoriteSong.matches('.liked')) {
                favoriteList.appendChild(favoriteSong.cloneNode(true))
                console.log(favoriteSong.cloneNode(true));
                
                likedList.push(index)
            } else {
                let removeSong = $(`.favorite_songs .song[data-index="${index}"]`)
                removeSong.remove()
                likedList.splice(likedList.indexOf(index), 1)
            }
        })
    },
    scrollToActiveSong: function() {
        setTimeout(() => {
            $('.song.active').scrollIntoView({
                behavior: 'smooth',
                block: 'end',
                inline: 'nearest',
            })
        }, 300)
    },
    loadCurrentSong: function() {
        heading.textContent = this.currentSong.name
        cdThumb.style.backgroundImage = `url('${this.currentSong.image}')`
        audio.src = this.currentSong.path

        // Add active class to Current Song on playList and favorite
        const activeSongs = $$('.song.active')
        const currentActiveSong = $$(`.song[data-index= "${this.currentIndex}"]`)
        currentActiveSong.forEach(activeSong => {
            activeSong.classList.add('active')
        })
        activeSongs.forEach(activeSong => {
            if (activeSong && activeSong.matches('.active')) {
                activeSong.classList.remove('active')
            }
        })

        // Lưu bài hát hiện tại vào storage
        this.setConfig('currentSongIndex', this.currentIndex)
        this.scrollToActiveSong()
    },
    loadConfig: function() {
        this.isRandom = this.config.isRandom || false
        this.isRepeat = this.config.isRepeat || false
        // Hiển thị trạng thái ban đầu của button random và repeat
        randomBtn.classList.toggle('active', this.isRandom)
        repeatBtn.classList.toggle('active', this.isRepeat)
        // Load currentIndex
        this.currentIndex = this.config.currentSongIndex || 0
        // Load theme
        if (this.config.classDark) {
            themeIcon.classList.toggle('fa-sun')
            $('body').classList.toggle('dark')
            themeText.textContent = themeIcon.matches('.fa-sun') ? 'Light mode' : 'Dark mode'
        }

        // Load likedList
        if ('likedListIndex' in this.config && this.config.likedListIndex.length) {
            this.handleLikedList(this.config.likedListIndex)
        }
    },
    nextSong: function() {
        this.currentIndex++
        if (this.currentIndex > this.songs.length - 1) {
            this.currentIndex = 0
        }
        this.loadCurrentSong()
    },
    prevSong: function() {
        this.currentIndex--
        if (this.currentIndex < 0) {
            this.currentIndex = this.songs.length - 1
        }
        this.loadCurrentSong()
    },
    playRandomSong: function() {
        let newIndex
        do {
            newIndex = Math.floor(Math.random() * this.songs.length)
        } while (newIndex === this.currentIndex)

        this.currentIndex = newIndex
        this.loadCurrentSong()
    },
    start: function () {
        // Gán cấu hình từ config vào ứng dụng
        this.loadConfig()

        // Định nghĩa các thuộc tính cho object
        this.defineProperties()

        // Lắng nghe và xử lý các sự kiện (DOM events)
        this.handleEvents()

        // Tải thông tin bài hát đầu tiên vào UI khi chạy ứng dụng
        this.loadCurrentSong()

        // Render playlist
        this.render()

        
    }
}

app.start()