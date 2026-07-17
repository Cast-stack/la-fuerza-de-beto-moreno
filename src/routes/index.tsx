import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import "../styles/beto-moreno.css";
import { supabase } from "../lib/supabase";
import type { Show, Song, Video, Member, Contact } from "../lib/supabase";
import { safeExternalUrl } from "../lib/utils";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "La Fuerza de Beto Moreno" },
      { name: "description", content: "Sitio oficial de La Fuerza de Beto Moreno." },
      { property: "og:title", content: "La Fuerza de Beto Moreno" },
      { property: "og:description", content: "Sitio oficial de La Fuerza de Beto Moreno." },
    ],
    links: [
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Cinzel+Decorative:wght@700&family=Raleway:wght@300;400;600&family=Dancing+Script:wght@700&display=swap" },
    ],
  }),
  component: Index,
});

function Index() {
  const [shows, setShows] = useState<Show[]>([]);
  const [songs, setSongs] = useState<Song[]>([]);
  const [videos, setVideos] = useState<Video[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [contact, setContact] = useState<Contact | null>(null);
  const [images, setImages] = useState<Record<string, string>>({});
  const [formStatus, setFormStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [text, setText] = useState<Record<string, string>>({});

  useEffect(() => {
    supabase.from("shows").select("*").order("date", { ascending: true }).then(({ data }) => data && setShows(data));
    supabase.from("songs").select("*").order("id", { ascending: true }).then(({ data }) => data && setSongs(data));
    supabase.from("videos").select("*").order("id", { ascending: true }).then(({ data }) => data && setVideos(data));
    supabase.from("members").select("*").order("sort_order", { ascending: true }).then(({ data }) => data && setMembers(data));
    supabase.from("contact").select("*").limit(1).single().then(({ data }) => data && setContact(data));
    supabase.from("site_images").select("key,url").then(({ data }) => data && setImages(Object.fromEntries((data as { key: string; url: string }[]).map((r) => [r.key, r.url]))));
    supabase.from("site_text").select("key,value").then(({ data }) => data && setText(Object.fromEntries((data as { key: string; value: string }[]).map((r) => [r.key, r.value]))));
  }, []);

  // Look up an overridable image URL by key (from the site_images table).
  const img = (key: string) => safeExternalUrl(images[key]);

  // Editable text: DB value by key, or the hardcoded fallback.
  const t = (key: string, fallback: string) => text[key] ?? fallback;

  // Contact form: open the visitor's email app pre-filled to the booking
  // address (contact.email, falling back to the band's Gmail).
  // Contact form: save the booking request to Supabase (bookings table).
  const handleContactSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    const val = (k: string) => String(data.get(k) ?? "").trim();
    setFormStatus("sending");
    const { error } = await supabase.from("bookings").insert({
      name: val("nombre"),
      email: val("correo") || null,
      phone: val("telefono") || null,
      event_type: val("tipo") || null,
      message: val("mensaje"),
    });
    if (error) {
      setFormStatus("error");
      return;
    }
    form.reset();
    setFormStatus("sent");
  };

  // Apply background-image overrides via CSS variables. When a key is unset,
  // the CSS var() fallback (the original baked-in image) is used, so the
  // default look never changes until an override row exists.
  useEffect(() => {
    const root = document.documentElement;
    const setVar = (key: string, cssVar: string) => {
      const url = safeExternalUrl(images[key]);
      if (url) root.style.setProperty(cssVar, `url("${url}")`);
    };
    setVar("hero_bg", "--img-hero-bg");
    setVar("hero_cosmic", "--img-hero-cosmic");
    setVar("bio_image", "--img-bio-image");
  }, [images]);

  useEffect(() => {
    // Scroll-reveal: reveal elements as they enter the viewport.
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 },
    );
    // Observe existing reveals + any added later (cards render after the
    // Supabase fetch resolves), so async content still animates in.
    const observeReveals = () =>
      document.querySelectorAll(".reveal:not(.visible)").forEach((el) => io.observe(el));
    observeReveals();
    const mo = new MutationObserver(observeReveals);
    mo.observe(document.body, { childList: true, subtree: true });

    // Highlight the active nav link based on scroll position.
    const onScroll = () => {
      const scrollY = window.scrollY;
      document.querySelectorAll<HTMLElement>("section[id]").forEach((sec) => {
        const top = sec.offsetTop - 90;
        const bottom = top + sec.offsetHeight;
        const link = document.querySelector<HTMLElement>(
          `.nav-links a[href="#${sec.id}"]`,
        );
        if (link)
          link.style.color =
            scrollY >= top && scrollY < bottom ? "var(--fire-bright)" : "";
      });
    };
    window.addEventListener("scroll", onScroll);

    return () => {
      io.disconnect();
      mo.disconnect();
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <>


<nav>
  <a href="#hero" className="nav-logo">
    <img src={img("logo") ?? "data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=="} alt="La Fuerza de Beto Moreno" />
  </a>
  <ul className="nav-links" id="navLinks">
    <li><a href="#musica">Música</a></li>
    <li><a href="#videos">Videos</a></li>
    <li><a href="#bio">La Banda</a></li>
    <li><a href="#miembros">Miembros</a></li>
    <li><a href="#shows">Shows</a></li>
    <li><a href="#contacto" className="nav-book">Contrataciones</a></li>
  </ul>
  <div className="hamburger" id="hamburger" onClick={() => document.getElementById("navLinks")?.classList.toggle("open")}>
    <span></span><span></span><span></span>
  </div>
</nav>


<section id="hero">
  <div className="hero-bg"></div>
  {img("hero_video") && (
    <video
      className="hero-video"
      src={img("hero_video")}
      poster={img("hero_bg")}
      autoPlay
      muted
      loop
      playsInline
      preload="auto"
    />
  )}
  <div className="hero-glow"></div>
  <div className="hero-content">
    {text["hero_tagline"] ? (<p className="hero-tagline font-extrabold text-lg">{text["hero_tagline"]}</p>) : (<p className="hero-tagline font-extrabold text-lg">Música <span>Norteña</span> &nbsp;·&nbsp; Waukegan, Illinois &nbsp;·&nbsp; Desde <span>2007</span></p>)}
    <div className="hero-ctas font-bold bg-inherit mt-5 mx-[67px] text-slate-50 px-[56px] py-[43px]">
      <a href="#musica" className="btn-fire">{t("hero_cta_listen", "Escuchar Ahora")}</a>
      <a href="#contacto" className="btn-outline">{t("hero_cta_booking", "Contrataciones")}</a>
    </div>
  </div>
</section>


<div id="stream-strip">
  <p className="strip-label">Escúchanos en todas las plataformas</p>
  <div className="stream-icons">
    <a href="https://open.spotify.com/search/la%20fuerza%20de%20beto%20moreno" target="_blank" rel="noopener noreferrer" className="stream-btn sb-spotify">
      <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" fill="currentColor"/></svg>
      Spotify
    </a>
    <a href="https://music.apple.com/us/artist/la-fuerza-de-beto-moreno/1677705854" target="_blank" rel="noopener noreferrer" className="stream-btn sb-apple">
      <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M23.994 6.124a9.23 9.23 0 00-.24-2.19c-.317-1.31-1.062-2.31-2.18-3.043a5.022 5.022 0 00-1.877-.726 10.496 10.496 0 00-1.564-.15c-.04-.003-.083-.01-.124-.013H5.986c-.152.01-.303.017-.455.026C4.786.07 4.043.15 3.34.428 2.004.958 1.04 1.88.475 3.208A4.905 4.905 0 00.05 4.885c-.013.5-.013 1-.013 1.499v10.952c0 .5 0 1 .013 1.5.05 1.062.338 2.022.898 2.885.726 1.099 1.775 1.836 3.07 2.168.5.13 1.01.182 1.526.207.5.013 1 .013 1.5.013h9.95c.5 0 1 0 1.5-.013.5-.025 1-.077 1.5-.207 1.3-.332 2.35-1.07 3.07-2.168.56-.863.848-1.823.898-2.885.013-.5.013-1 .013-1.5V6.124zm-11.99 8.886c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm4.99-1.5c0 2.76-2.24 5-5 5s-5-2.24-5-5 2.24-5 5-5 5 2.24 5 5zm1.5-8.388a1.5 1.5 0 110 3 1.5 1.5 0 010-3z" fill="currentColor"/></svg>
      Apple Music
    </a>
    <a href="https://www.youtube.com/channel/UCiHk7SOwEbKIBXM2srPduvw" target="_blank" rel="noopener noreferrer" className="stream-btn sb-youtube">
      <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" fill="currentColor"/></svg>
      YouTube
    </a>
    <a href="https://music.amazon.com/search/la+fuerza+de+beto+moreno" target="_blank" rel="noopener noreferrer" className="stream-btn sb-amazon">
      <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M13.958 10.09c0 1.232.029 2.256-.591 3.351-.502.891-1.301 1.438-2.186 1.438-1.214 0-1.922-.924-1.922-2.292 0-2.692 2.415-3.182 4.699-3.182v.685zm3.186 7.705c-.209.189-.512.201-.745.074-1.047-.869-1.235-1.274-1.814-2.106-1.734 1.767-2.962 2.297-5.209 2.297-2.66 0-4.731-1.641-4.731-4.927 0-2.565 1.391-4.309 3.37-5.164 1.715-.754 4.11-.891 5.942-1.095v-.41c0-.753.06-1.642-.384-2.294-.385-.579-1.124-.82-1.775-.82-1.205 0-2.277.618-2.54 1.897-.054.285-.261.567-.548.582l-3.061-.333c-.259-.056-.548-.266-.472-.66C5.97 2.506 9.037 1.5 11.776 1.5c1.398 0 3.226.372 4.328 1.432 1.399 1.307 1.266 3.052 1.266 4.948v4.479c0 1.347.559 1.94 1.085 2.667.185.261.226.573-.01.768-.588.49-1.633 1.399-2.206 1.908l-.095-.907zM22.939 18.969C20.484 20.818 16.971 21.839 13.994 21.839c-4.038 0-7.671-1.493-10.419-3.977-.216-.196-.023-.464.237-.312 2.965 1.725 6.628 2.762 10.414 2.762 2.552 0 5.358-.53 7.942-1.627.39-.166.717.256.771.284zM23.77 17.97c-.294-.378-1.943-.179-2.684-.09-.225.026-.26-.169-.057-.31 1.314-.923 3.471-.656 3.72-.347.248.31-.065 2.459-1.299 3.485-.189.159-.369.074-.285-.134.277-.692.898-2.241.605-2.604z" fill="currentColor"/></svg>
      Amazon Music
    </a>
    <a href="#musica" className="stream-btn sb-download">
      <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12 16l-5-5h3V4h4v7h3l-5 5zm5 2H7v2h10v-2z" fill="currentColor"/></svg>
      Descargar
    </a>
  </div>
</div>


<section id="musica">
  <div className="container">
    <p className="section-label reveal">Discografía</p>
    <h2 className="section-title reveal">Nuestra <span className="accent">Música</span></h2>
    <div className="divider reveal"></div>
    <div className="music-grid">
      {songs.map((s: Song) => (
        <div
          key={s.id}
          className="song-card reveal"
          onClick={() => { const u = safeExternalUrl(s.apple_music_url); if (u) window.open(u, "_blank", "noopener,noreferrer"); }}
          style={s.apple_music_url ? { cursor: "pointer" } : undefined}
        >
          <div className="song-art">
            {s.emoji ?? "🎵"}
            <div className="song-play"><svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg></div>
          </div>
          <div className="song-info">
            <div className="song-title">{s.title}</div>
            <div className="song-year">Single · {s.year}</div>
          </div>
        </div>
      ))}
    </div>
  </div>
</section>


<section id="videos">
  <div className="container">
    <p className="section-label reveal">En Vivo &amp; Videoclips</p>
    <h2 className="section-title reveal">Nuestros <span className="accent">Videos</span></h2>
    <div className="divider reveal"></div>
    <div className="videos-grid">
      {videos.map((v: Video) => (
        <div key={v.id} className="video-embed reveal">
          <iframe src={safeExternalUrl(v.youtube_url)} allowFullScreen title={v.title}></iframe>
        </div>
      ))}
    </div>
    <div style={{textAlign: "center", marginTop: "2rem"}}>
      <a href={safeExternalUrl(contact?.youtube_videos_url) ?? "https://www.youtube.com/@lafuerzadebetomoreno9762"} target="_blank" rel="noopener noreferrer" className="btn-outline">{t("videos_more", "Ver Más en YouTube →")}</a>
    </div>
  </div>
</section>


<section id="bio">
  <div className="container">
    <div className="bio-inner">
      <div className="bio-image-wrap reveal">
        <div className="bio-image"></div>
      </div>
      <div className="reveal">
        <p className="section-label">La Historia</p>
        <h2 className="section-title">La <span className="accent">Banda</span></h2>
        <div className="divider"></div>
        <div className="bio-tribute">🕊️ En memoria de Beto Moreno — El fundador, el alma</div>
        {text["bio"] ? text["bio"].split(/\n\n+/).map((para: string, i: number) => (<p key={i} className="bio-text">{para}</p>)) : (<><p className="bio-text">
          <strong>La Fuerza de Beto Moreno</strong> nació en <strong>Waukegan, Illinois</strong>, 
          en el año <strong>2007</strong> bajo la visión de <strong>Beto Moreno</strong>, un músico 
          apasionado cuyo amor por la <strong>música norteña</strong> fue el corazón de todo lo que construyó.
        </p>
        <p className="bio-text">
          Hoy, la banda continúa su camino honrando el legado de Beto — su nombre, su música y su espíritu 
          viven en cada nota que tocamos. Seguimos adelante con la misma fuerza y pasión que él nos enseñó.
        </p>
        <p className="bio-text">
          Con raíces profundas en la tradición norteña y un sonido que conecta con el corazón de nuestra 
          comunidad, <strong>La Fuerza</strong> sigue escribiendo su historia — para Beto, y para todos sus fans.
        </p></>)}
        <div className="bio-origin">
          <div className="origin-item">
            <div className="origin-value">{t("stat1_value", "2007")}</div>
            <div className="origin-label">{t("stat1_label", "Fundada")}</div>
          </div>
          <div className="origin-item">
            <div className="origin-value">{t("stat2_value", "Waukegan, IL")}</div>
            <div className="origin-label">{t("stat2_label", "Origen")}</div>
          </div>
          <div className="origin-item">
            <div className="origin-value">{t("stat3_value", "Norteña")}</div>
            <div className="origin-label">{t("stat3_label", "Género")}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>


<section id="miembros">
  <div className="container">
    <p className="section-label reveal">Quiénes Somos</p>
    <h2 className="section-title reveal">Los <span className="accent">Miembros</span></h2>
    <div className="divider reveal"></div>
    <div className="members-grid">
      {members.map((m: Member) => (
        <div key={m.id} className="member-card reveal">
          <div
            className="member-photo"
            style={m.photo_url ? { backgroundImage: `url(${m.photo_url})` } : undefined}
          ></div>
          <div className="member-info">
            <div className="member-name">{m.name}</div>
            <div className="member-role">{m.role}</div>
          </div>
        </div>
      ))}
    </div>
  </div>
</section>


<section id="shows">
  <div className="container">
    <p className="section-label reveal">Próximas Fechas</p>
    <h2 className="section-title reveal">Shows <span className="accent">&amp; Eventos</span></h2>
    <div className="divider reveal"></div>
    {shows.length === 0 ? (
      <div className="shows-empty reveal">
        <div className="shows-empty-icon">🎸</div>
        <h3>{t("shows_empty_title", "Próximamente")}</h3>
        <p>{t("shows_empty_text", "Nuevas fechas en camino — síguenos en redes sociales para no perderte nada.")}</p>
        <div style={{marginTop: "1.5rem"}}>
          <a href="#contacto" className="btn-fire">{t("shows_empty_cta", "Contratar la Banda")}</a>
        </div>
      </div>
    ) : (
      <div className="shows-list reveal">
        {shows.map((s: Show) => {
          const d = new Date(s.date + "T12:00:00");
          const month = d.toLocaleString("es-MX", { month: "short" }).toUpperCase();
          const day = d.getDate();
          return (
            <div key={s.id} className="show-row">
              <div className="show-date">
                <span className="show-month">{month}</span>
                <span className="show-day">{day}</span>
              </div>
              <div className="show-details">
                <div className="show-venue">{s.venue}</div>
                <div className="show-location">{s.city}</div>
              </div>
              <div className="show-action">
                <a
                  href={safeExternalUrl(s.ticket_url) ?? "#contacto"}
                  target={safeExternalUrl(s.ticket_url) ? "_blank" : undefined}
                  rel="noopener noreferrer"
                  className="btn-fire btn-sm"
                >
                  Boletos
                </a>
              </div>
            </div>
          );
        })}
      </div>
    )}
  </div>
</section>


<section id="contacto">
  <div className="container">
    <p className="section-label reveal">Bookings &amp; Contrataciones</p>
    <h2 className="section-title reveal">Contac<span className="accent">to</span></h2>
    <div className="divider reveal"></div>
    <div className="contact-grid">
      <form className="contact-form reveal" onSubmit={handleContactSubmit}>
        <div className="form-group">
          <label>Nombre completo</label>
          <input type="text" name="nombre" placeholder="Tu nombre" required />
        </div>
        <div className="form-group">
          <label>Correo electrónico</label>
          <input type="email" name="correo" placeholder="tu@correo.com" required />
        </div>
        <div className="form-group">
          <label>Teléfono</label>
          <input type="tel" name="telefono" placeholder="+1 (000) 000-0000" />
        </div>
        <div className="form-group">
          <label>Tipo de evento</label>
          <select name="tipo">
            <option value="">Selecciona una opción</option>
            <option>Boda / Wedding</option>
            <option>Quinceañera</option>
            <option>Fiesta Privada</option>
            <option>Evento Público / Concierto</option>
            <option>Festival</option>
            <option>Otro</option>
          </select>
        </div>
        <div className="form-group">
          <label>Mensaje</label>
          <textarea rows={4} name="mensaje" required placeholder="Cuéntanos sobre tu evento — fecha, lugar, ciudad..."></textarea>
        </div>
        <button type="submit" disabled={formStatus === "sending"} className="btn-fire" style={{alignSelf: "flex-start", border: "none", fontSize: "0.82rem", cursor: "pointer", opacity: formStatus === "sending" ? 0.6 : 1}}>
          {formStatus === "sending" ? "Enviando…" : "Enviar Mensaje →"}
        </button>
        {formStatus === "sent" && (
          <p style={{ color: "var(--fire-bright)", fontSize: "0.85rem", marginTop: "0.75rem" }}>
            ¡Gracias! Tu mensaje fue enviado. Te contactaremos pronto.
          </p>
        )}
        {formStatus === "error" && (
          <p style={{ color: "#ff6b6b", fontSize: "0.85rem", marginTop: "0.75rem" }}>
            No se pudo enviar. Intenta de nuevo, o escríbenos a{" "}
            {contact?.email ?? "lafuerzadebetomoreno@gmail.com"}.
          </p>
        )}
      </form>
      <div className="contact-info reveal">
        <h3>Hablemos</h3>
        {contact?.location && (
          <div className="contact-detail">
            <div className="contact-icon">
              <svg viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
            </div>
            <div>
              <strong style={{color: "var(--white)"}}>Ubicación</strong><br />
              {contact.location}
            </div>
          </div>
        )}
        {contact?.email && (
          <div className="contact-detail">
            <div className="contact-icon">
              <svg viewBox="0 0 24 24"><path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>
            </div>
            <div>
              <strong style={{color: "var(--white)"}}>Email / Booking</strong><br />
              <a href={`mailto:${contact.email}`} style={{color: "var(--fire-bright)"}}>{contact.email}</a>
            </div>
          </div>
        )}
        {contact?.phone && (
          <div className="contact-detail">
            <div className="contact-icon">
              <svg viewBox="0 0 24 24"><path d="M6.62 10.79a15.05 15.05 0 006.59 6.59l2.2-2.2a1 1 0 011.01-.24c1.12.37 2.33.57 3.58.57a1 1 0 011 1V20a1 1 0 01-1 1C10.61 21 3 13.39 3 4a1 1 0 011-1h3.5a1 1 0 011 1c0 1.25.2 2.46.57 3.58a1 1 0 01-.25 1.01l-2.2 2.2z"/></svg>
            </div>
            <div>
              <strong style={{color: "var(--white)"}}>Teléfono</strong><br />
              <a href={`tel:${contact.phone}`} style={{color: "var(--fire-bright)"}}>{contact.phone}</a>
            </div>
          </div>
        )}
        <div className="social-row">
          {contact?.facebook_url && (
            <a href={safeExternalUrl(contact.facebook_url)} target="_blank" className="social-link" title="Facebook" rel="noopener noreferrer">
              <svg viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
            </a>
          )}
          {contact?.instagram_url && (
            <a href={safeExternalUrl(contact.instagram_url)} target="_blank" className="social-link" title="Instagram" rel="noopener noreferrer">
              <svg viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
            </a>
          )}
          {contact?.youtube_url && (
            <a href={safeExternalUrl(contact.youtube_url)} target="_blank" className="social-link" title="YouTube" rel="noopener noreferrer">
              <svg viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
            </a>
          )}
          {contact?.tiktok_url && (
            <a href={safeExternalUrl(contact.tiktok_url)} target="_blank" className="social-link" title="TikTok" rel="noopener noreferrer">
              <svg viewBox="0 0 24 24"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.78 1.52V6.75a4.85 4.85 0 01-1.01-.06z"/></svg>
            </a>
          )}
        </div>
      </div>
    </div>
  </div>
</section>


<footer>
  <img className="footer-logo" src={img("logo") ?? "data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=="} alt="La Fuerza de Beto Moreno" />
  <p className="footer-tribute">✦ En memoria y honor de Beto Moreno ✦</p>
  <div className="footer-links">
    <a href="#musica">Música</a>
    <a href="#videos">Videos</a>
    <a href="#bio">La Banda</a>
    <a href="#miembros">Miembros</a>
    <a href="#shows">Shows</a>
    <a href="#contacto">Contacto</a>
  </div>
  <p className="footer-copy">© 2024 La Fuerza de Beto Moreno · Waukegan, Illinois · Todos los derechos reservados</p>
</footer>


    </>
  );
}
