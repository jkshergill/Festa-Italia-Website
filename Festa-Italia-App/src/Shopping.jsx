import React from 'react';
import './Shopping.css';
function Shopping() {
    return (
        <>
            <header>
                <div className="menu-text">Menu</div>
            </header>
            <main className="container">
                <section className="image-section">
                    <div className="image-container">
                        <p>Tokens</p>
                        <img src="../../images/Tokens.png" alt="Tokens" />
                    </div>

                    <div div className="text-boxes">
                        <div className="text-box">
                            <p>Red Tokens - $10<br />Yellow Tokens - $2</p>
                        </div>
                    </div>
                </section>
            </main>
        </>
    );
}

export default Shopping;

