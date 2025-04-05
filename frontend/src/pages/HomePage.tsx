import { Link } from "react-router-dom";

const HomePage = () => {
  return (
    <div className="home-page">
      <div className="hero">
        <h1>WorldGuard</h1>
        <p className="tagline">
          Secure your Telegram groups with World ID verification
        </p>

        <div className="cta-container">
          <Link to="/verify" className="cta-button">
            Verify with World ID
          </Link>

          <a
            href="https://t.me/worldguard_bot"
            target="_blank"
            rel="noreferrer"
            className="secondary-button"
          >
            Add Bot to Telegram
          </a>
        </div>
      </div>

      <div className="features">
        <div className="feature">
          <h2>Spam Protection</h2>
          <p>
            Keep your Telegram groups free of spam and bot accounts by requiring
            human verification through World ID.
          </p>
        </div>

        <div className="feature">
          <h2>Privacy First</h2>
          <p>
            World ID's zero-knowledge proofs allow verification without
            revealing personal information.
          </p>
        </div>

        <div className="feature">
          <h2>Easy Setup</h2>
          <p>
            Add the WorldGuard bot to your Telegram group, and it will handle
            verification for all new members automatically.
          </p>
        </div>
      </div>

      <footer>
        <p>
          Powered by{" "}
          <a href="https://worldcoin.org/" target="_blank" rel="noreferrer">
            World ID
          </a>
        </p>
      </footer>
    </div>
  );
};

export default HomePage;
