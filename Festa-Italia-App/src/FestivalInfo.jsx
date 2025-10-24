// Import the original stylesheet from the sibling `frontend/style` folder.
// Note: this path goes up two levels from this file (src -> react-festival -> frontend)
import '../../style/festival_info.css'

export default function FestivalInfo(){
return (
    <div>
        <header className="site-header">
            <div className="container header-inner">
                <div className="logo-wrap">
                    <a href="#" className="logo" aria-label="Festa Italia home">
                        <img src="../../images/logo2.gif" alt="Festa Italia logo" />
                    </a>
                </div>
                <button className="nav-toggle" aria-controls="primary-navigation" aria-expanded="false" aria-label="Toggle navigation">
                    <span className="sr-only">Menu</span>
                    <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                        <path className="line-top" d="M3 6h18" fill="none" strokeWidth="2" strokeLinecap="round"></path>
                        <path className="line-mid" d="M3 12h18" fill="none" strokeWidth="2" strokeLinecap="round"></path>
                        <path className="line-bottom" d="M3 18h18" fill="none" strokeWidth="2" strokeLinecap="round"></path>
                    </svg>
                </button>
            </div>
        </header>

    <main>
        <div className="page-layout has-sidebar container">
            <div className="content-column">
                <section id="about" className="section features">
                    <h2>Friday Music Schedule</h2>

                <div className="schedule-grid" role="list">
                    <article className="schedule-item" role="listitem">
                        <div className="meta">
                            <div className="time">3:00pm - 5:00pm</div>
                            <img src="../../images/scarlet_band.jpg" alt="Scarlet band" />
                        </div>
                        <div className="desc">
                            <div className="act">Scarlet</div>
                            <div className="bio">Scarlet brings high-energy pop-rock and classic favorites to the Festa stage.</div>
                        </div>
                    </article>

                    <article className="schedule-item" role="listitem">
                        <div className="meta">
                            <div className="time">6:00pm - 9:00pm</div>
                            <img src="../../images/money_band.jpg" alt="The Money Band" />
                        </div>
                        <div className="desc">
                            <div className="act">The Money Band</div>
                            <div className="bio">A crowd favorite playing upbeat covers and original tunes to keep the party moving.</div>
                        </div>
                    </article>

                    <h2>Saturday Music Schedule</h2>

                    <article className="schedule-item" role="listitem">
                        <div className="meta">
                            <div className="time">TBD</div>
                        </div>
                        <div className="desc">
                            <div className="act">Act 3</div>
                            <div className="placeholder">Details coming soon</div>
                        </div>
                    </article>

                    <article className="schedule-item" role="listitem">
                        <div className="meta">
                            <div className="time">TBD</div>
                        </div>
                        <div className="desc">
                            <div className="act">Act 4</div>
                            <div className="placeholder">Details coming soon</div>
                        </div>
                    </article>

                    <h2>Sunday Music Schedule</h2>

                    <article className="schedule-item" role="listitem">
                        <div className="meta">
                            <div className="time">TBD</div>
                        </div>
                        <div className="desc">
                            <div className="act">Act 5</div>
                            <div className="placeholder">Details coming soon</div>
                        </div>
                    </article>

                            <article className="schedule-item" role="listitem">
                                <div className="meta">
                                    <div className="time">TBD</div>
                                </div>
                                <div className="desc">
                                    <div className="act">Act 6</div>
                                    <div className="placeholder">Details coming soon</div>
                                </div>
                            </article>
                </div>
                </section>
            </div>
        </div>
    </main>

    <footer className="site-footer">
        <div className="container footer-inner">
            <img src="../../images/logo_01.jpeg" alt="Festa Italia logo" height={100} />
            <p> Festa Italia Foundation, Inc. All rights reserved.</p>
        </div>
    </footer>
    </div>
)
}
