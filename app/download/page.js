import Link from "next/link";
import styles from "./download.module.css";

export const metadata = {
  title: "Download Truth Machine for Android",
  description:
    "Install the native Truth Machine Android app and turn one evidence-minded quote each day into a live wallpaper.",
};

const APK_PATH = "/downloads/TruthMachine.apk";
const CHECKSUM_PATH = "/downloads/TruthMachine.apk.sha256";

export default function DownloadPage() {
  return (
    <main className={styles.page}>
      <div className={styles.glowOne} />
      <div className={styles.glowTwo} />

      <nav className={styles.nav}>
        <Link className={styles.logo} href="/">
          <span />
          the·truth·machine
        </Link>
        <Link className={styles.back} href="/">Back to the evidence</Link>
      </nav>

      <section className={styles.hero}>
        <div className={styles.copy}>
          <p className={styles.kicker}>Native Android · English only · Free</p>
          <h1>Put one reality check on the screen you see every day.</h1>
          <p className={styles.lede}>
            Truth Machine for Android turns a daily evidence-minded quote into a
            living home-screen and lock-screen wallpaper—without accounts, ads,
            analytics, or background tracking.
          </p>

          <div className={styles.actions}>
            <a className={styles.primary} href={APK_PATH} download>
              Download Android APK
            </a>
            <a className={styles.secondary} href={CHECKSUM_PATH}>
              Verify SHA-256
            </a>
          </div>

          <div className={styles.trustRow}>
            <span>Android 8+</span>
            <span>31 daily quotes</span>
            <span>Automatic midnight refresh</span>
            <span>Home · Lock · Both*</span>
          </div>
        </div>

        <div className={styles.device} aria-label="Truth Machine live wallpaper preview">
          <div className={styles.deviceGlow} />
          <p className={styles.deviceDate}>SATURDAY · 25 JULY</p>
          <blockquote>
            A confident claim is not the same thing as a tested claim.
          </blockquote>
          <p className={styles.deviceEvidence}>
            Confidence is a feature of the speaker. Evidence is a feature of the world.
          </p>
          <span className={styles.deviceBrand}>THE · TRUTH · MACHINE</span>
        </div>
      </section>

      <section className={styles.features}>
        <article>
          <span>01</span>
          <h2>Changes daily</h2>
          <p>
            The live wallpaper selects a new quote from the date on your phone and
            redraws itself after local midnight.
          </p>
        </article>
        <article>
          <span>02</span>
          <h2>Three visual moods</h2>
          <p>
            Choose Abyss, Aurora, or Dawn. Every mood remains readable behind icons
            and across different screen shapes.
          </p>
        </article>
        <article>
          <span>03</span>
          <h2>Built for both screens</h2>
          <p>
            The app opens Android’s native live-wallpaper picker. Select Home and
            lock screens, or Both, when your device provides that option.
          </p>
        </article>
        <article>
          <span>04</span>
          <h2>Evidence stays one tap away</h2>
          <p>
            Share today’s quote, open the Reality Check, or jump directly into the
            interactive Life Atlas.
          </p>
        </article>
      </section>

      <section className={styles.install}>
        <div>
          <p className={styles.kicker}>Install in three steps</p>
          <h2>From download to living wallpaper.</h2>
        </div>
        <ol>
          <li>
            <b>Download the APK.</b>
            <span>Allow installation from your browser when Android asks.</span>
          </li>
          <li>
            <b>Open Truth Machine.</b>
            <span>Choose a wallpaper mood and tap Apply live wallpaper.</span>
          </li>
          <li>
            <b>Choose the destination.</b>
            <span>Select Home, Lock, or Both in the Android system picker.</span>
          </li>
        </ol>
      </section>

      <p className={styles.compatibility}>
        * Live wallpaper availability on the lock screen is controlled by Android
        and the device manufacturer. Some devices expose only the home-screen option.
      </p>
    </main>
  );
}
