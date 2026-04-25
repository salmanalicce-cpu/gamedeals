import React, { useEffect, useMemo, useRef, useState } from 'react'

const SHEET_ID = '1lXBrmYgflnxQZN2L9obEqNAlqE3tN8YLplWyKmRcs7k'
const BEST_DEALS_SHEET_ID = '1nLf3RYEj3gC7B85jWStNXdb-I6RlsNG06Ju6eY_XxBs'
const DEFAULT_DISCOUNT = '-90%'
const DEFAULT_TAG = 'Best Deal'
const INSTAGRAM_URL = 'https://www.instagram.com/gamedeals.pk?igsh=MTBuNjZmMnVseG1lbQ%3D%3D&utm_source=qr'
const LOGO_URL = 'https://raw.githubusercontent.com/salmanalicce-cpu/gamedeals/main/assets/logo.png'

function goToInstagram(event) {
  if (event) event.preventDefault()
  window.location.href = INSTAGRAM_URL
}

const HERO_SIDE_CARDS = [
  {
    image: 'https://preview.redd.it/what-games-from-that-picture-are-a-must-play-for-you-v0-h2oqoh04daoe1.png?width=640&crop=smart&auto=webp&s=0c72b467b0baf5daf7f0f1811a99b923601108b5',
    title: 'Request Any Game',
    discount: '',
    tag: '',
    isRequest: true,
  },
  {
    image: 'https://cms-assets.xboxservices.com/assets/00/bc/00bc6b3e-67c8-4cd4-bda2-d03740ccd6c6.jpg?n=Ultimate+GameLibrary.jpg&q=90&o=f&w=562&h=316',
    title: 'Xbox Game Pass',
    price: 'From Rs 1200',
    discount: '',
    tag: '',
  },
]

function normalizeGame(item, index) {
  const title = typeof item?.title === 'string' && item.title.trim() ? item.title.trim() : `Game ${index + 1}`

  return {
    title,
    price: typeof item?.price === 'string' && item.price.trim() ? item.price.trim() : '$0.00',
    oldPrice: typeof item?.oldPrice === 'string' && item.oldPrice.trim() ? item.oldPrice.trim() : '$0.00',
    discount:
      typeof item?.discount === 'string' && item.discount.trim() ? item.discount.trim() : DEFAULT_DISCOUNT,
    image:
      typeof item?.image === 'string' && item.image.trim()
        ? item.image.trim()
        : 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1200&q=80',
    tag: typeof item?.tag === 'string' && item.tag.trim() ? item.tag.trim() : DEFAULT_TAG,
  }
}

async function fetchSheetData(sheetName, sheetId = SHEET_ID) {
  try {
    const url = `https://opensheet.elk.sh/${sheetId}/${sheetName}`
    const response = await fetch(url)

    if (!response.ok) {
      console.warn(`Unable to load ${sheetName}: ${response.status}`)
      return []
    }

    const data = await response.json()

    if (!Array.isArray(data)) {
      console.warn(`Invalid response format for ${sheetName}`)
      return []
    }

    return data.map(normalizeGame)
  } catch (error) {
    console.warn(`Error loading ${sheetName}:`, error)
    return []
  }
}

function SearchDropdown({ results, onSelect }) {
  if (!results.length) {
    return (
      <div className="absolute left-0 right-0 top-full z-50 mt-2 rounded-2xl border border-white/10 bg-neutral-900 p-4 text-sm text-white/60 shadow-xl">
        No games found.
      </div>
    )
  }

  return (
    <div className="absolute left-0 right-0 top-full z-50 mt-2 max-h-80 overflow-y-auto rounded-2xl border border-white/10 bg-neutral-900 shadow-xl">
      {results.slice(0, 8).map((game, index) => (
        <button
          key={`${game.title}-${index}`}
          onClick={onSelect}
          className="flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-white/5"
        >
          <img src={game.image} alt={game.title} className="h-12 w-16 flex-none rounded object-cover" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-white">{game.title}</p>
            <p className="text-xs text-white/50">Steam Account</p>
          </div>
          <p className="flex-none text-sm font-bold text-white">{game.price}</p>
        </button>
      ))}
    </div>
  )
}

export default function GameStoreHomepage() {
  const pcSectionRef = useRef(null)
  const currentYear = new Date().getFullYear()

  const [isBuyPopupOpen, setIsBuyPopupOpen] = useState(false)
  const [isPcGamesOpen, setIsPcGamesOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isInstagramPopupOpen, setIsInstagramPopupOpen] = useState(false)
  const [isRulesPopupOpen, setIsRulesPopupOpen] = useState(false)
  const [highlightPC, setHighlightPC] = useState(false)
  const [isConsolePopupOpen, setIsConsolePopupOpen] = useState(false)
  const [isFaqOpen, setIsFaqOpen] = useState(false)
  const [isSignInOpen, setIsSignInOpen] = useState(false)
  const [selectedPlatform, setSelectedPlatform] = useState('')
  const [hoveredGame, setHoveredGame] = useState(null)
  const [hoverPosition, setHoverPosition] = useState({ x: 0, y: 0 })
  const [canHover, setCanHover] = useState(false)

  const [games, setGames] = useState([])
  const [bestDeals, setBestDeals] = useState([])

  useEffect(() => {
    try {
      const mediaQuery = window.matchMedia && window.matchMedia('(hover: hover)')
      setCanHover(Boolean(mediaQuery && mediaQuery.matches))
    } catch (error) {
      setCanHover(false)
    }

    let isMounted = true

    const loadData = async () => {
      const [sheetGames, deals] = await Promise.all([
        fetchSheetData('Sheet1'),
        fetchSheetData('Sheet1', BEST_DEALS_SHEET_ID),
      ])

      if (!isMounted) return

      setGames(sheetGames)
      setBestDeals(deals)
    }

    loadData()

    return () => {
      isMounted = false
    }
  }, [])

  const featuredGames = useMemo(() => games.slice(0, 4), [games])
  const pcGames = useMemo(() => games, [games])

  const sections = useMemo(
    () => [
      {
        title: 'PC Games',
        items: featuredGames,
        action: () => setIsPcGamesOpen(true),
      },
      {
        title: 'Best Deals',
        items: bestDeals.length > 0 ? bestDeals : featuredGames,
      },
    ],
    [bestDeals, featuredGames]
  )

  const selectedSection = useMemo(
    () => sections.find((section) => section.title === 'PC Games'),
    [sections]
  )

  const searchableGames = useMemo(() => {
    const mergedGames = [...pcGames, ...bestDeals, ...featuredGames]
    return mergedGames.filter(
      (game, index, self) => index === self.findIndex((item) => item.title === game.title)
    )
  }, [pcGames, bestDeals, featuredGames])

  const filteredGames = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    if (!query) return []

    return searchableGames.filter((game) =>
      [game.title, game.tag, 'Steam Account'].join(' ').toLowerCase().includes(query)
    )
  }, [searchQuery, searchableGames])

  const updateSearch = (value) => {
    setSearchQuery(value)
    setIsSearchOpen(value.trim().length > 0)
  }

  const handleSearchKeyDown = (event) => {
    if (event.key === 'Escape') {
      setIsSearchOpen(false)
      setSearchQuery('')
    }
  }

  const handleSearchSelect = () => {
    setIsBuyPopupOpen(true)
    setIsSearchOpen(false)
  }

  const scrollToPcSection = () => {
    const headerOffset = 100
    const element = pcSectionRef.current

    if (element) {
      const elementPosition = element.getBoundingClientRect().top + window.pageYOffset
      const offsetPosition = elementPosition - headerOffset

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      })
    }

    setHighlightPC(true)
    window.setTimeout(() => setHighlightPC(false), 1500)
  }

  const renderGameCard = (game, key) => (
    <article
      key={key}
      onMouseEnter={
        canHover
          ? (event) => {
              setHoveredGame({ image: game.image, title: game.title })
              setHoverPosition({ x: event.clientX, y: event.clientY })
            }
          : undefined
      }
      onMouseMove={
        canHover
          ? (event) => {
              setHoverPosition({ x: event.clientX, y: event.clientY })
            }
          : undefined
      }
      onMouseLeave={canHover ? () => setHoveredGame(null) : undefined}
      className="group overflow-hidden rounded-[1.25rem] border border-white/10 bg-white/5 transition hover:-translate-y-1 hover:border-orange-400/30 hover:bg-white/[0.07] sm:rounded-[1.75rem]"
    >
      <div className="relative">
        <img src={game.image} alt={game.title} className="h-36 w-full object-cover transition duration-300 group-hover:scale-105 sm:h-56" />
        <div className="absolute right-2 top-2 rounded-full bg-orange-500 px-2 py-1 text-[10px] font-black text-black shadow-lg shadow-orange-500/25 sm:right-4 sm:top-4 sm:px-3 sm:text-xs">
          {game.discount}
        </div>
      </div>
      <div className="p-3 sm:p-5">
        <div className="mb-2 flex items-center justify-between gap-3 text-xs text-white/45">
          <span>{game.tag}</span>
          <span className="hidden sm:inline">Steam Account</span>
        </div>
        <h3 className="text-sm font-bold leading-snug sm:text-lg">{game.title}</h3>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="text-lg font-black sm:text-2xl">{game.price}</div>
            <div className="hidden text-sm text-white/35 line-through sm:block">{game.oldPrice}</div>
          </div>
          <button
            onClick={() => setIsBuyPopupOpen(true)}
            className="w-full rounded-xl bg-white px-3 py-2 text-xs font-bold text-black transition hover:scale-[1.03] sm:w-auto sm:rounded-2xl sm:px-4 sm:text-sm"
          >
            Buy
          </button>
        </div>
      </div>
    </article>
  )

  return (
    <div className="min-h-screen bg-neutral-950 text-white">
      <header className="sticky top-0 z-50 border-b border-white/10 bg-neutral-950/85 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center">
              <img src={LOGO_URL} alt="GameDeals Logo" className="h-full w-full object-contain" />
            </div>
            <div>
              <p className="text-lg font-bold tracking-wide">GameDeals</p>
              <p className="text-xs text-white/50">Digital game marketplace</p>
            </div>
          </div>

          <div className="relative hidden flex-1 items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 md:flex">
            <svg viewBox="0 0 24 24" className="h-5 w-5 text-white/50" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="7" />
              <path d="M20 20l-3.5-3.5" />
            </svg>
            <input
              value={searchQuery}
              onChange={(event) => updateSearch(event.target.value)}
              onKeyDown={handleSearchKeyDown}
              placeholder="Search games, gift cards, DLC..."
              className="w-full bg-transparent text-base text-white outline-none placeholder:text-white/40 md:text-sm"
            />
            <button
              onClick={() => setIsSearchOpen(searchQuery.trim().length > 0)}
              className="rounded-xl bg-orange-500 px-4 py-2 text-sm font-semibold text-black transition hover:scale-[1.02]"
            >
              Search
            </button>
            {isSearchOpen && searchQuery.trim().length > 0 ? <SearchDropdown results={filteredGames} onSelect={handleSearchSelect} /> : null}
          </div>

          <nav className="hidden items-center gap-6 lg:flex">
            <button onClick={scrollToPcSection} className="text-sm text-white/80 transition hover:text-white">
              PC
            </button>
            <button
              onClick={() => {
                setSelectedPlatform('PlayStation')
                setIsConsolePopupOpen(true)
              }}
              className="text-sm text-white/80 transition hover:text-white"
            >
              PlayStation
            </button>
            <button
              onClick={() => {
                setSelectedPlatform('Xbox')
                setIsConsolePopupOpen(true)
              }}
              className="text-sm text-white/80 transition hover:text-white"
            >
              Xbox
            </button>
            <button
              onClick={() => {
                setSelectedPlatform('Nintendo')
                setIsConsolePopupOpen(true)
              }}
              className="text-sm text-white/80 transition hover:text-white"
            >
              Nintendo
            </button>
          </nav>

          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={() => setIsSignInOpen(true)}
              className="hidden rounded-2xl border border-white/10 px-4 py-2 text-sm text-white/80 transition hover:bg-white/5 hover:text-white sm:block"
            >
              Sign in
            </button>
            <button className="rounded-2xl bg-orange-500 px-4 py-2 text-sm font-semibold text-black transition hover:scale-[1.02]">
              Cart (0)
            </button>
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-4 pb-4 md:hidden sm:px-6 lg:px-8">
          <div className="relative">
            <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
              <svg viewBox="0 0 24 24" className="h-5 w-5 text-white/50" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="7" />
                <path d="M20 20l-3.5-3.5" />
              </svg>
              <input
                value={searchQuery}
                onChange={(event) => updateSearch(event.target.value)}
                onKeyDown={handleSearchKeyDown}
                placeholder="Search games..."
                className="w-full bg-transparent text-base text-white outline-none placeholder:text-white/40"
              />
              <button onClick={() => setIsSearchOpen(searchQuery.trim().length > 0)} className="rounded-xl bg-orange-500 px-3 py-2 text-xs font-semibold text-black">
                Search
              </button>
            </div>
            {isSearchOpen && searchQuery.trim().length > 0 ? <SearchDropdown results={filteredGames} onSelect={handleSearchSelect} /> : null}
          </div>
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(249,115,22,0.22),transparent_30%),radial-gradient(circle_at_left,rgba(255,255,255,0.08),transparent_25%)]" />
          <div className="mx-auto grid max-w-7xl gap-8 px-4 py-14 sm:px-6 lg:grid-cols-[1.2fr_0.8fr] lg:px-8 lg:py-20">
            <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-neutral-900 shadow-2xl shadow-black/30">
              <img
                src="https://cdn.fastly.steamstatic.com/store/home/store_home_share.jpg"
                alt="Featured game"
                className="h-[420px] w-full object-cover opacity-55"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-transparent" />
              <div className="absolute inset-0 flex flex-col justify-end p-8 sm:p-10">
                <h1 className="max-w-2xl text-3xl font-black leading-tight sm:text-5xl lg:text-6xl">
                  All PC Games. Unbeatable Prices.
                </h1>
                <p className="mt-3 max-w-xl text-sm leading-6 text-white/70 sm:mt-4 sm:text-base">
                  Buy top PC games at unbeatable prices with fast support and easy ordering.
                </p>
                <div className="mt-6 flex flex-col gap-3 sm:mt-8 sm:flex-wrap sm:flex-row sm:items-center sm:gap-4">
                  <button
                    onClick={scrollToPcSection}
                    className="w-full rounded-2xl bg-orange-500 px-6 py-3 text-sm font-bold text-black transition hover:scale-[1.02] sm:w-auto"
                  >
                    Shop Now
                  </button>
                  <button
                    onClick={() => setIsRulesPopupOpen(true)}
                    className="w-full rounded-2xl border border-white/15 bg-white/5 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10 sm:w-auto"
                  >
                    Rules
                  </button>
                  <div className="hidden rounded-2xl border border-emerald-400/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300 sm:block">
                    Up to 90% off
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-2 hidden gap-4 sm:grid sm:grid-cols-2 lg:mt-0 lg:grid-cols-1">
              {HERO_SIDE_CARDS.map((game, index) => (
                <div key={index} className="group relative overflow-hidden rounded-[1.75rem] border border-white/10 bg-white/5">
                  <img src={game.image} alt={game.title} className="h-48 w-full object-cover opacity-60 transition duration-300 group-hover:scale-105" />
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 z-10 p-5">
                    <div className="mb-2 flex items-center justify-between">
                      {game.discount ? (
                        <span className="absolute right-4 top-4 rounded-full bg-orange-500 px-2.5 py-1 text-xs font-bold text-black">
                          {game.discount}
                        </span>
                      ) : null}
                      {game.tag ? <span className="text-xs text-white/60">{game.tag}</span> : null}
                    </div>
                    <h3 className="text-lg font-bold">{game.title}</h3>
                    {game.isRequest ? (
                      <div className="mt-4">
                        <p className="mb-3 text-sm text-white/75">Can’t find your game? Send us a request.</p>
                        <a href={INSTAGRAM_URL} onClick={goToInstagram} className="inline-block rounded-xl bg-orange-500 px-4 py-2 text-sm font-semibold text-black">
                          Request
                        </a>
                      </div>
                    ) : (
                      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <span className="text-xl font-black text-white">{game.price}</span>
                        <button
                          onClick={() => setIsBuyPopupOpen(true)}
                          className="w-full rounded-xl bg-white px-4 py-2 text-sm font-bold text-black transition hover:scale-[1.03] sm:w-auto"
                        >
                          Buy
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="hidden gap-4 rounded-[2rem] border border-white/10 bg-white/5 p-5 sm:grid sm:grid-cols-3 sm:p-6">
            {[
              ['Game Account', 'Receive a product instantly after purchase'],
              ['Payment Methods', 'Easypaisa, JazzCash, Bank Transfer, Binance'],
              ['Life Time Warranty', 'Reliable long-term support for all products'],
            ].map(([title, text]) => (
              <div key={title} className="rounded-[1.5rem] border border-white/10 bg-black/20 p-4">
                <h3 className="text-sm font-bold uppercase tracking-[0.18em] text-white/75">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-white/60">{text}</p>
              </div>
            ))}
          </div>
        </section>

        {sections.map((section) => (
          <section
            ref={section.title === 'PC Games' ? pcSectionRef : null}
            key={section.title}
            className={`mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 transition-all duration-500 ${highlightPC && section.title === 'PC Games' ? 'ring-2 ring-orange-400 shadow-[0_0_40px_rgba(249,115,22,0.4)] rounded-2xl' : ''}`}
          >
            <div className="mb-5 flex items-end justify-between gap-4">
              <div>
                <h2 className="text-2xl font-black sm:text-3xl">{section.title}</h2>
                <p className="mt-1 hidden text-sm text-white/55 sm:block">All PC games at affordable prices.</p>
              </div>
              <button
                onClick={section.action || (() => {})}
                className="rounded-2xl border border-white/10 px-4 py-2 text-sm font-medium text-white/75 transition hover:bg-white/5 hover:text-white"
              >
                View all
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 sm:gap-5 xl:grid-cols-4">
              {section.items.map((game, index) => renderGameCard(game, `${section.title}-${game.title}-${index}`))}
            </div>
          </section>
        ))}
        <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="mb-5">
            <h2 className="text-2xl font-black sm:text-3xl">FAQs</h2>
            <p className="mt-1 hidden text-sm text-white/55 sm:block">Quick answers before you buy.</p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {[
              ['What will I receive?', 'You’ll receive a Steam account with the product ready to download.'],
              ['Can I change account details?', 'No, email and password cannot be changed on shared accounts.'],
              ['How fast is delivery?', 'Delivery is usually instant, with a maximum wait time of around 1 hour.'],
              ['Do you provide warranty?', 'Yes, we provide support and warranty for our products.'],
              ['Can I update the game?', 'Yes, you can update the game to the latest version anytime.'],
              ['Need help?', 'Message us on Instagram and we’ll help you quickly.'],
            ].map(([question, answer]) => (
              <div key={question} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <h3 className="text-sm font-bold text-white">{question}</h3>
                <p className="mt-2 text-sm leading-6 text-white/60">{answer}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      {hoveredGame ? (
        <div className="pointer-events-none fixed z-[110] hidden xl:block" style={{ top: hoverPosition.y + 20, left: hoverPosition.x + 20 }}>
          <div className="w-[260px] overflow-hidden rounded-[1.25rem] border border-white/10 bg-neutral-900 shadow-2xl shadow-black/50">
            <img src={hoveredGame.image} alt={hoveredGame.title} className="h-[320px] w-full object-cover" />
            <div className="border-t border-white/10 bg-black/40 px-3 py-2">
              <p className="text-xs font-semibold text-white">{hoveredGame.title}</p>
            </div>
          </div>
        </div>
      ) : null}

      {isPcGamesOpen ? (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/75 px-4 py-6 backdrop-blur-sm">
          <div className="relative max-h-[92vh] w-full max-w-6xl overflow-hidden rounded-[1.5rem] border border-white/10 bg-neutral-950 shadow-2xl shadow-black/60 sm:rounded-[2rem]">
            <div className="flex items-center justify-between border-b border-white/10 px-5 py-4 sm:px-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-orange-300">Browse Collection</p>
                <h2 className="mt-1 text-2xl font-black sm:text-3xl">{selectedSection?.title || 'PC Games'}</h2>
                <p className="mt-1 text-sm text-white/55">Explore all available titles in a focused popup window.</p>
              </div>
              <button
                onClick={() => setIsPcGamesOpen(false)}
                className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white/80 transition hover:bg-white/10 hover:text-white"
              >
                Close
              </button>
            </div>

            <div className="max-h-[calc(90vh-96px)] overflow-y-auto px-5 py-5 sm:px-6 sm:py-6">
              <div className="mb-5 grid gap-4 rounded-[1.75rem] border border-white/10 bg-white/5 p-4 sm:grid-cols-3">
                <div className="rounded-[1.25rem] border border-white/10 bg-black/20 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-white/45">Total Titles</p>
                  <p className="mt-2 text-3xl font-black">{pcGames.length}</p>
                </div>
                <div className="rounded-[1.25rem] border border-white/10 bg-black/20 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-white/45">Best Discount</p>
                  <p className="mt-2 text-3xl font-black text-orange-400">-90%</p>
                </div>
                <div className="rounded-[1.25rem] border border-white/10 bg-black/20 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-white/45">Delivery</p>
                  <p className="mt-2 text-3xl font-black text-emerald-400">Instant</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 sm:gap-5 xl:grid-cols-4">
                {pcGames.map((game, index) => renderGameCard(game, `${game.title}-${index}`))}
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {isConsolePopupOpen ? (
        <div className="fixed inset-0 z-[103] flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-neutral-900 p-6 text-center shadow-2xl">
            <h2 className="mb-3 text-2xl font-bold">{selectedPlatform} Coming Soon</h2>
            <p className="text-sm leading-6 text-white/70">
              We’re currently working on {selectedPlatform} products.
              <br />
              Right now, we only deal in PC Games.
            </p>
            <button
              onClick={() => setIsConsolePopupOpen(false)}
              className="mt-6 rounded-xl border border-white/10 px-5 py-2 text-sm text-white/80 transition hover:bg-white/10 hover:text-white"
            >
              Close
            </button>
          </div>
        </div>
      ) : null}

      {isFaqOpen ? (
        <div className="fixed inset-0 z-[104] flex items-center justify-center bg-black/70 px-3 py-4 backdrop-blur-sm sm:px-4">
          <div className="flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-white/10 bg-neutral-900 shadow-2xl">
            <div className="border-b border-white/10 px-4 py-4 sm:px-6">
              <h2 className="text-xl font-bold sm:text-2xl">Frequently Asked Questions</h2>
            </div>

            <div className="overflow-y-auto px-4 py-4 sm:px-6 sm:py-5">
              <div className="space-y-4 text-sm leading-7 text-white/75">
                <div>
                  <p className="font-semibold text-white">What will I receive?</p>
                  <p>You’ll get a Steam account (email + password) with the game ready to download.</p>
                </div>
                <div>
                  <p className="font-semibold text-white">Can I change the account details?</p>
                  <p>No, the email and password can’t be changed on shared accounts.</p>
                </div>
                <div>
                  <p className="font-semibold text-white">How fast is delivery?</p>
                  <p>Delivery is usually instant. In rare cases, it can take up to 1 hour—we’re fast.</p>
                </div>
                <div>
                  <p className="font-semibold text-white">Can I buy a changeable account?</p>
                  <p>Yes—private accounts with changeable credentials are available at a higher price.</p>
                </div>
                <div>
                  <p className="font-semibold text-white">Do you offer a warranty?</p>
                  <p>Yes, we cover our products and provide support if any issues come up.</p>
                </div>
                <div>
                  <p className="font-semibold text-white">Can I update the game?</p>
                  <p>Of course—you can update to the latest version anytime.</p>
                </div>
                <div>
                  <p className="font-semibold text-white">Important setup note</p>
                  <p>After purchase, download and launch the game once. When you reach the main menu, close the game and switch Steam to Offline Mode. Then enjoy your game.</p>
                </div>
              </div>
            </div>

            <div className="border-t border-white/10 px-4 py-4 sm:px-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <a href={INSTAGRAM_URL} onClick={goToInstagram} className="inline-block rounded-xl bg-orange-500 px-5 py-2 text-center text-sm font-semibold text-black">
                  Chat
                </a>
                <button
                  onClick={() => setIsFaqOpen(false)}
                  className="rounded-xl border border-white/10 px-5 py-2 text-sm text-white/80 transition hover:bg-white/10 hover:text-white"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {isRulesPopupOpen ? (
        <div className="fixed inset-0 z-[102] flex items-center justify-center bg-black/70 px-3 py-4 backdrop-blur-sm sm:px-4">
          <div className="flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-white/10 bg-neutral-900 shadow-2xl">
            <div className="border-b border-white/10 px-4 py-4 sm:px-6">
              <h2 className="text-xl font-bold sm:text-2xl">What You’ll Receive</h2>
            </div>

            <div className="overflow-y-auto px-4 py-4 sm:px-6 sm:py-5">
              <div className="space-y-3 text-sm leading-7 text-white/75">
                <p className="font-semibold text-white">After purchase, you will receive:</p>
                <p>➤ Steam licensed account with the games.</p>
                <p>➤ Update the game to the latest version at any time.</p>
                <p>➤ Email and password cannot be changed.</p>
                <p>➤ Guaranteed assistance and solutions for any issues.</p>
                <p>➤ If you have any questions about the product, you can message us in chats.</p>
              </div>
            </div>

            <div className="border-t border-white/10 px-4 py-4 sm:px-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <a href={INSTAGRAM_URL} onClick={goToInstagram} className="inline-block rounded-xl bg-orange-500 px-5 py-2 text-center text-sm font-semibold text-black">
                  Chat
                </a>
                <button
                  onClick={() => setIsRulesPopupOpen(false)}
                  className="rounded-xl border border-white/10 px-5 py-2 text-sm text-white/80 transition hover:bg-white/10 hover:text-white"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {isInstagramPopupOpen ? (
        <div className="fixed inset-0 z-[101] flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-neutral-900 p-6 text-center shadow-2xl">
            <h2 className="mb-3 text-2xl font-bold">Instagram Support</h2>
            <p className="text-sm leading-6 text-white/70">Please contact us on Instagram for help, order support, or any questions.</p>
            <a href={INSTAGRAM_URL} onClick={goToInstagram} className="mt-5 inline-block rounded-xl bg-orange-500 px-5 py-2 text-sm font-semibold text-black">
              Open Instagram
            </a>
            <button
              onClick={() => setIsInstagramPopupOpen(false)}
              className="mt-4 block w-full rounded-xl border border-white/10 py-2 text-sm text-white/80 hover:bg-white/10"
            >
              Close
            </button>
          </div>
        </div>
      ) : null}

      {isSignInOpen ? (
        <div className="fixed inset-0 z-[105] flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-neutral-900 p-6 text-center shadow-2xl">
            <h2 className="mb-3 text-2xl font-bold">🚧 Feature Coming Soon</h2>
            <p className="text-sm leading-6 text-white/70">
              We’re currently working on the sign-in feature.
              <br />
              It will be available very soon.
            </p>
            <button
              onClick={() => setIsSignInOpen(false)}
              className="mt-6 block w-full rounded-xl border border-white/10 py-2 text-sm text-white/80 hover:bg-white/10"
            >
              Close
            </button>
          </div>
        </div>
      ) : null}

      {isBuyPopupOpen ? (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-neutral-900 p-6 text-center shadow-2xl">
            <h2 className="mb-3 text-2xl font-bold">🚧 Payment Coming Soon</h2>
            <p className="text-sm leading-6 text-white/70">
              We are currently working on our payment system.
              <br />
              Please contact us on Instagram to complete your purchase.
            </p>
            <a href={INSTAGRAM_URL} onClick={goToInstagram} className="mt-5 inline-block rounded-xl bg-orange-500 px-5 py-2 text-sm font-semibold text-black">
              Contact on Instagram
            </a>
            <button
              onClick={() => setIsBuyPopupOpen(false)}
              className="mt-4 block w-full rounded-xl border border-white/10 py-2 text-sm text-white/80 hover:bg-white/10"
            >
              Close
            </button>
          </div>
        </div>
      ) : null}

      <footer className="border-t border-white/10 bg-black/30">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-2 lg:grid-cols-4 lg:px-8">
          <div>
            <p className="text-lg font-black">GameDeals</p>
            <p className="mt-3 max-w-xs text-sm leading-6 text-white/55">© {currentYear} GameDeals. All rights reserved.</p>
          </div>
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-white/75">Social Media</p>
            <div className="mt-3 space-y-2 text-sm text-white/55">
              <a href={INSTAGRAM_URL} onClick={goToInstagram} className="block text-left transition hover:text-white">
                Instagram
              </a>
              <p>Discord</p>
            </div>
          </div>
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-white/75">Support</p>
            <div className="mt-3 space-y-2 text-sm text-white/55">
              <a href={INSTAGRAM_URL} onClick={goToInstagram} className="block text-left transition hover:text-white">
                Contact
              </a>
              <button onClick={() => setIsFaqOpen(true)} className="block text-left transition hover:text-white">
                FAQs
              </button>
            </div>
          </div>
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-white/75">Trust</p>
            <div className="mt-3 space-y-2 text-sm text-white/55">
              <p>Instant Delivery</p>
              <p>24/7 Support</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
