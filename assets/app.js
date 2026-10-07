/* Dusk demo state and shared chrome. One store, one key, every screen reads through it.
   Classic script (not a module) because module scripts are blocked on file://. */
(function () {
  "use strict";
  const KEY = "blissers.demo.v4";

  /* ---------- dates, relative to the day the demo is opened ---------- */
  const TODAY = new Date();
  TODAY.setHours(0, 0, 0, 0);
  const pad = (n) => String(n).padStart(2, "0");
  const toIso = (dt) => `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())}`;
  const addDays = (dt, n) => { const c = new Date(dt); c.setDate(c.getDate() + n); return c; };
  const day = (n) => toIso(addDays(TODAY, n));
  const stamp = (daysAgo, hh = 10, mm = 0) => { const c = addDays(TODAY, -daysAgo); c.setHours(hh, mm, 0, 0); return c.toISOString(); };
  /* Ratings carry a full timestamp, not a plain date; splitting those on "-" made an Invalid Date
     and the formatter threw on the feedback and vendor pages. */
  const parseIso = (iso) => { if (/T/.test(iso)) return new Date(iso); const [y, m, d] = iso.split("-").map(Number); return new Date(y, m - 1, d); };

  /* ---------- seed ---------- */
  function seed() {
    const vendors = [
      { id: "v1", name: "Claro", category: "Dining", area: "Sarona", rating: 4.8, reviews: 412, priceLevel: 3, status: "active", commission: 12, description: "Seasonal Mediterranean kitchen in a restored Templer house. Open fire, local produce, a long wine list.", hours: "12:00–23:30", contact: { name: "Avi Rosen", phone: "+972 3 601 7777", email: "avi@claro.example" }, joined: day(-412), payout: "IL12 0108 0000 0001 2345 678" },
      { id: "v2", name: "Mantra Spa", category: "Wellness", area: "Neve Tzedek", rating: 4.7, reviews: 288, priceLevel: 3, status: "active", commission: 15, description: "Hammam, treatment rooms and a quiet courtyard two streets from the sea.", hours: "09:00–22:00", contact: { name: "Yael Mor", phone: "+972 3 510 2020", email: "yael@mantra.example" }, joined: day(-380), payout: "IL34 0126 0000 0002 2334 455" },
      { id: "v3", name: "Alma Bar", category: "Nightlife", area: "Allenby", rating: 4.5, reviews: 931, priceLevel: 2, status: "active", commission: 10, description: "Courtyard bar with a late kitchen and a different DJ every night of the week.", hours: "19:00–03:00", contact: { name: "Tom Harel", phone: "+972 3 629 3030", email: "tom@alma.example" }, joined: day(-300), payout: "IL56 0110 0000 0003 1122 334" },
      { id: "v4", name: "Sea & Sun Sailing", category: "Sea & Outdoors", area: "Jaffa Port", rating: 4.9, reviews: 174, priceLevel: 3, status: "active", commission: 15, description: "Two sailing yachts out of the old port. Sunset sails daily, private charters by request.", hours: "08:00–21:00", contact: { name: "Gil Ashkenazi", phone: "+972 52 300 4040", email: "gil@seasun.example" }, joined: day(-250), payout: "IL78 0120 0000 0004 5566 778" },
      { id: "v5", name: "Nava Yoga Loft", category: "Wellness", area: "Florentin", rating: 4.8, reviews: 356, priceLevel: 1, status: "active", commission: 12, description: "Rooftop classes at sunrise and sunset, sound baths on Thursdays.", hours: "06:30–21:00", contact: { name: "Nava Shani", phone: "+972 54 505 0505", email: "nava@navaloft.example" }, joined: day(-520), payout: "IL90 0104 0000 0005 9988 776" },
      { id: "v6", name: "Teder Rooftop", category: "Nightlife", area: "Rothschild", rating: 4.4, reviews: 1208, priceLevel: 2, status: "active", commission: 10, description: "Open-air rooftop over the boulevard. Cinema on Wednesdays, DJs at the weekend.", hours: "18:00–02:00", contact: { name: "Roni Dayan", phone: "+972 3 560 6060", email: "roni@teder.example" }, joined: day(-610), payout: "IL12 0112 0000 0006 4433 221" },
      { id: "v7", name: "Hall 21", category: "Culture", area: "Rothschild", rating: 4.6, reviews: 203, priceLevel: 2, status: "active", commission: 8, description: "Independent stage for dance and new theatre. Two shows a night, Thursday to Saturday.", hours: "18:00–23:00", contact: { name: "Maayan Lev", phone: "+972 3 525 2121", email: "maayan@hall21.example" }, joined: day(-190), payout: "IL34 0131 0000 0007 2211 009" },
      { id: "v8", name: "Ceramics by Noa", category: "Workshops", area: "Jaffa Flea Market", rating: 4.9, reviews: 97, priceLevel: 2, status: "active", commission: 12, description: "Small studio with six wheels. Tasters for beginners, evening glazing sessions with wine.", hours: "10:00–21:00", contact: { name: "Noa Barzilai", phone: "+972 50 808 0808", email: "noa@noaceramics.example" }, joined: day(-140), payout: "IL56 0127 0000 0008 7766 554" },
      { id: "v9", name: "Casa Blanca Hotel", category: "Stays", area: "Neve Tzedek", rating: 4.7, reviews: 540, priceLevel: 4, status: "active", commission: 10, description: "Twenty-four rooms around a garden pool, a short walk from the beach.", hours: "Reception 24h", contact: { name: "Orit Sela", phone: "+972 3 700 9090", email: "orit@casablanca.example" }, joined: day(-700), payout: "IL78 0109 0000 0009 1234 567" },
      { id: "v10", name: "Yafo Grill", category: "Dining", area: "Jaffa", rating: 4.6, reviews: 1532, priceLevel: 2, status: "active", commission: 10, description: "Charcoal grill and a mezze table that keeps coming. Loud, fast, loved.", hours: "11:00–00:00", contact: { name: "Sami Khoury", phone: "+972 3 682 1010", email: "sami@yafogrill.example" }, joined: day(-455), payout: "IL90 0117 0000 0010 8765 432" },
      { id: "v11", name: "Gordon Surf Club", category: "Sea & Outdoors", area: "Gordon Beach", rating: 4.7, reviews: 622, priceLevel: 2, status: "active", commission: 15, description: "Surf and SUP lessons from the beach hut, boards and wetsuits included.", hours: "06:00–19:00", contact: { name: "Daniel Arad", phone: "+972 52 222 1111", email: "daniel@gordonsurf.example" }, joined: day(-330), payout: "IL12 0134 0000 0011 3456 789" },
      { id: "v12", name: "City Walks TLV", category: "Culture", area: "White City", rating: 4.8, reviews: 418, priceLevel: 1, status: "active", commission: 12, description: "Guided walks through Bauhaus boulevards, Florentin street art and the Jaffa alleys.", hours: "09:00–19:00", contact: { name: "Leah Katz", phone: "+972 54 777 3333", email: "leah@citywalks.example" }, joined: day(-280), payout: "IL34 0111 0000 0012 2468 135" },
      { id: "v13", name: "Vino Vino", category: "Dining", area: "Dizengoff", rating: 0, reviews: 0, priceLevel: 2, status: "pending", commission: 10, description: "Natural wine bar with a small plates menu. Applied last week.", hours: "17:00–01:00", contact: { name: "Michal Oren", phone: "+972 54 101 2020", email: "michal@vinovino.example" }, joined: day(-6), payout: "" },
      { id: "v14", name: "Hamam Levinsky", category: "Wellness", area: "Levinsky", rating: 0, reviews: 0, priceLevel: 2, status: "pending", commission: 12, description: "Traditional hammam with a modern treatment menu. Documents uploaded, awaiting review.", hours: "10:00–22:00", contact: { name: "Gal Nahum", phone: "+972 50 404 9090", email: "gal@hamamlevinsky.example" }, joined: day(-2), payout: "" },
      { id: "v15", name: "Lola Cocktails", category: "Nightlife", area: "Florentin", rating: 3.9, reviews: 266, priceLevel: 2, status: "suspended", commission: 10, description: "Suspended after three unresolved no-shows in September.", hours: "20:00–03:00", contact: { name: "Ido Barak", phone: "+972 3 518 5050", email: "ido@lola.example" }, joined: day(-230), payout: "IL56 0106 0000 0015 9753 108", statusReason: "Three confirmed bookings refused at the door, 12–19 Sep." },
    ];

    const offers = [
      { id: "o1", vendorId: "v1", title: "Tasting menu for two", price: 680, unit: "per couple", duration: 150, status: "active", tags: ["Evening", "Date night"], description: "Seven courses from the open fire, paired with the day's market. Seated at 19:30 or 21:00." },
      { id: "o2", vendorId: "v1", title: "Chef's counter lunch", price: 190, unit: "per person", duration: 90, status: "active", tags: ["Lunch", "Counter"], description: "Four courses at the counter, watching the pass. Weekdays only." },
      { id: "o3", vendorId: "v2", title: "Signature massage, 60 min", price: 390, unit: "per person", duration: 60, status: "active", tags: ["Relax"], description: "Deep tissue or Swedish, followed by tea in the courtyard." },
      { id: "o4", vendorId: "v2", title: "Couples spa ritual", price: 920, unit: "per couple", duration: 120, status: "active", tags: ["Couples", "Hammam"], description: "Hammam, scrub and a side-by-side massage in the garden room." },
      { id: "o5", vendorId: "v3", title: "Reserved table and welcome drinks", price: 220, unit: "per group", duration: 120, status: "active", tags: ["Late", "Drinks"], description: "A courtyard table held for you, two cocktails each on arrival." },
      { id: "o6", vendorId: "v4", title: "Sunset sail", price: 280, unit: "per person", duration: 120, status: "active", tags: ["Sunset", "Sea"], description: "Two hours along the coast with wine and snacks on board. Leaves 90 minutes before sunset." },
      { id: "o7", vendorId: "v4", title: "Private yacht, 3 hours", price: 2400, unit: "per group", duration: 180, status: "active", tags: ["Private", "Up to 10"], description: "The whole boat, a skipper, and the route you choose." },
      { id: "o8", vendorId: "v5", title: "Rooftop sunset yoga", price: 80, unit: "per person", duration: 75, status: "active", tags: ["Rooftop", "All levels"], description: "Slow flow on the roof as the light goes. Mats provided." },
      { id: "o9", vendorId: "v5", title: "Sound bath", price: 120, unit: "per person", duration: 60, status: "active", tags: ["Thursday", "Relax"], description: "Gongs and bowls, lying down, lights off. Thursdays at 20:00." },
      { id: "o10", vendorId: "v6", title: "Rooftop DJ night entry", price: 90, unit: "per person", duration: 240, status: "active", tags: ["Weekend", "DJ"], description: "Skip the queue with a first drink included." },
      { id: "o11", vendorId: "v7", title: "Contemporary dance evening", price: 160, unit: "per person", duration: 90, status: "active", tags: ["Show", "20:30"], description: "Two short pieces by resident companies, with a talk afterwards." },
      { id: "o12", vendorId: "v8", title: "Wheel throwing taster", price: 240, unit: "per person", duration: 120, status: "active", tags: ["Beginner", "Hands-on"], description: "Two hours on the wheel, two pieces fired and glazed for you to collect." },
      { id: "o13", vendorId: "v8", title: "Glaze and sip evening", price: 180, unit: "per person", duration: 120, status: "active", tags: ["Evening", "Wine"], description: "Glaze a ready-made piece with a glass of wine in hand." },
      { id: "o14", vendorId: "v9", title: "Garden suite, one night", price: 1450, unit: "per night", duration: 1440, status: "active", tags: ["Stay", "Pool"], description: "Suite with a private terrace onto the garden. Breakfast included." },
      { id: "o15", vendorId: "v10", title: "Mezze feast", price: 140, unit: "per person", duration: 90, status: "active", tags: ["Lunch", "Sharing"], description: "The full table: twenty salads, grilled meats, fresh pita. Nobody leaves hungry." },
      { id: "o16", vendorId: "v11", title: "Beginner surf lesson", price: 170, unit: "per person", duration: 90, status: "active", tags: ["Morning", "Beginner"], description: "Ninety minutes with an instructor, board and wetsuit included." },
      { id: "o17", vendorId: "v11", title: "SUP at sunrise", price: 130, unit: "per person", duration: 60, status: "active", tags: ["Sunrise", "Calm"], description: "Paddle out on flat water as the city wakes up." },
      { id: "o18", vendorId: "v12", title: "Bauhaus walking tour", price: 110, unit: "per person", duration: 150, status: "active", tags: ["Walk", "UNESCO"], description: "The White City's best facades and the stories behind them." },
      { id: "o19", vendorId: "v12", title: "Street art of Florentin", price: 95, unit: "per person", duration: 120, status: "active", tags: ["Walk", "Art"], description: "Murals, stencils and the artists who made them, ending at a bar." },
      { id: "o20", vendorId: "v2", title: "Hot stone express, 30 min", price: 220, unit: "per person", duration: 30, status: "paused", tags: ["Quick"], description: "Paused while the stone room is refitted." },
      { id: "o21", vendorId: "v1", title: "Wine pairing add-on", price: 160, unit: "per person", duration: 0, status: "draft", tags: ["Add-on"], description: "Five glasses matched to the tasting menu." },
      { id: "o22", vendorId: "v13", title: "Natural wine flight", price: 120, unit: "per person", duration: 60, status: "draft", tags: ["Wine"], description: "Four glasses and a plate of cheese. Goes live when the vendor is approved." },
    ];

    const events = [
      { id: "e1", title: "Jaffa Jazz Night", vendorId: "v3", venue: "Alma Bar courtyard", date: day(3), time: "21:00", price: 140, capacity: 120, sold: 88, held: 2, status: "on_sale", description: "A quartet from the Jaffa scene, two sets, the courtyard kitchen open until late." },
      { id: "e2", title: "Sunrise Beach Yoga", vendorId: "v5", venue: "Gordon Beach", date: day(5), time: "06:30", price: 60, capacity: 200, sold: 134, held: 2, status: "on_sale", description: "Two hundred mats on the sand, one teacher, one sunrise. Coffee after." },
      { id: "e3", title: "Mediterranean Wine Fair", vendorId: "v1", venue: "Sarona Market hall", date: day(9), time: "19:00", price: 220, capacity: 300, sold: 212, held: 0, status: "on_sale", description: "Forty producers from Israel, Greece, Lebanon and Italy. Entry includes a glass and twelve tastings." },
      { id: "e4", title: "White City Architecture Walk", vendorId: "v12", venue: "Dizengoff Square", date: day(2), time: "10:00", price: 90, capacity: 25, sold: 25, held: 0, status: "sold_out", description: "The monthly walk, this time around Bialik Street and the Pagoda House." },
      { id: "e5", title: "Full Moon Sail Party", vendorId: "v4", venue: "Jaffa Port, pier 3", date: day(12), time: "20:00", price: 320, capacity: 40, sold: 17, held: 0, status: "on_sale", description: "Three hours at anchor off the coast under a full moon. DJ, open bar, swimming if you dare." },
      { id: "e6", title: "Ceramics Open Studio", vendorId: "v8", venue: "Ceramics by Noa", date: day(7), time: "16:00", price: 0, capacity: 30, sold: 11, held: 0, status: "on_sale", description: "Free afternoon in the studio. Watch a firing, try a wheel, buy seconds at half price." },
      { id: "e7", title: "Rooftop Cinema: Classics", vendorId: "v6", venue: "Teder Rooftop", date: day(1), time: "20:30", price: 75, capacity: 80, sold: 64, held: 0, status: "on_sale", description: "A classic on the big screen, blankets on the chairs, popcorn from the kitchen." },
      { id: "e8", title: "Autumn Food Market", vendorId: "v10", venue: "Jaffa Flea Market", date: day(-4), time: "11:00", price: 0, capacity: 500, sold: 410, held: 0, status: "past", description: "Forty stalls, one Saturday. Happened last week." },
      { id: "e9", title: "Silent Disco on the Pier", vendorId: "v6", venue: "Tel Aviv Port", date: day(16), time: "22:00", price: 110, capacity: 150, sold: 32, held: 0, status: "on_sale", description: "Three channels, three DJs, headphones at the door." },
    ];

    const users = [
      { id: "u1", name: "Maya Levi", email: "maya.levi@example.com", phone: "+972 54 123 4567", role: "member", plan: "Plus", status: "active", joined: day(-210), city: "Tel Aviv" },
      { id: "u2", name: "Daniel Cohen", email: "daniel.c@example.com", phone: "+972 52 234 5678", role: "member", plan: "Free", status: "active", joined: day(-45), city: "Tel Aviv" },
      { id: "u3", name: "Noa Friedman", email: "noa.f@example.com", phone: "+972 50 345 6789", role: "member", plan: "Premium", status: "active", joined: day(-320), city: "Herzliya" },
      { id: "u4", name: "Omer Shalev", email: "omer.s@example.com", phone: "+972 54 456 7890", role: "member", plan: "Plus", status: "active", joined: day(-90), city: "Ramat Gan" },
      { id: "u5", name: "Tamar Ben-David", email: "tamar.bd@example.com", phone: "+972 53 567 8901", role: "member", plan: "Premium", status: "active", joined: day(-400), city: "Tel Aviv" },
      { id: "u6", name: "Yonatan Peretz", email: "yonatan.p@example.com", phone: "+972 52 678 9012", role: "member", plan: "Free", status: "active", joined: day(-12), city: "Jaffa" },
      { id: "u7", name: "Shira Katz", email: "shira.k@example.com", phone: "+972 54 789 0123", role: "member", plan: "Plus", status: "active", joined: day(-150), city: "Tel Aviv" },
      { id: "u8", name: "Eitan Mizrahi", email: "eitan.m@example.com", phone: "+972 50 890 1234", role: "member", plan: "Free", status: "invited", joined: day(-1), city: "Bat Yam" },
      { id: "u9", name: "Lior Avraham", email: "lior.a@example.com", phone: "+972 52 901 2345", role: "member", plan: "Plus", status: "active", joined: day(-77), city: "Tel Aviv" },
      { id: "u10", name: "Hila Goldberg", email: "hila.g@example.com", phone: "+972 54 012 3456", role: "member", plan: "Free", status: "active", joined: day(-33), city: "Givatayim" },
      { id: "u11", name: "Avi Rosen", email: "avi@claro.example", phone: "+972 3 601 7777", role: "vendor", plan: "—", status: "active", joined: day(-412), city: "Tel Aviv", vendorId: "v1" },
      { id: "u12", name: "Dana Weiss", email: "dana@dusk.example", phone: "+972 54 999 0001", role: "admin", plan: "—", status: "active", joined: day(-800), city: "Tel Aviv" },
      { id: "u13", name: "Rotem Segal", email: "rotem.s@example.com", phone: "+972 50 111 2222", role: "member", plan: "Free", status: "suspended", joined: day(-260), city: "Tel Aviv", statusReason: "Chargeback on two bookings in August." },
      { id: "u14", name: "Michal Oren", email: "michal@vinovino.example", phone: "+972 54 101 2020", role: "vendor", plan: "—", status: "active", joined: day(-6), city: "Tel Aviv", vendorId: "v13" },
      { id: "u15", name: "Gal Nahum", email: "gal@hamamlevinsky.example", phone: "+972 50 404 9090", role: "vendor", plan: "—", status: "active", joined: day(-2), city: "Tel Aviv", vendorId: "v14" },
      { id: "u16", name: "Ido Barak", email: "ido@lola.example", phone: "+972 3 518 5050", role: "vendor", plan: "—", status: "active", joined: day(-230), city: "Tel Aviv", vendorId: "v15" },
    ];

    const item = (offerId, dateOffset, time, guests, status, extra) => {
      const o = offers.find((x) => x.id === offerId);
      const qty = o.unit === "per person" ? guests : 1;
      return Object.assign({ offerId, vendorId: o.vendorId, date: day(dateOffset), time, guests, price: o.price * qty, status }, extra || {});
    };
    const bookings = [
      { id: "b1", code: "BLS-7F3K", userId: "u1", title: "Thursday evening for two", source: "concierge", createdAt: stamp(1, 18, 40), paymentId: "p1", status: "confirmed",
        items: [item("o3", 2, "17:30", 2, "confirmed"), item("o1", 2, "20:00", 2, "confirmed"), item("o5", 2, "22:45", 2, "confirmed")] },
      { id: "b2", code: "BLS-Q2ND", userId: "u1", title: "Sunset sail", source: "direct", createdAt: stamp(0, 9, 12), paymentId: "p2", status: "pending",
        items: [item("o6", 4, "17:15", 2, "pending")] },
      { id: "b3", code: "BLS-M8TA", userId: "u1", title: "Mezze lunch in Jaffa", source: "direct", createdAt: stamp(5, 11, 0), paymentId: "p3", status: "completed",
        items: [item("o15", -3, "13:00", 2, "redeemed", { redeemedAt: stamp(3, 13, 4) })] },
      { id: "b4", code: "BLS-C4RM", userId: "u1", title: "Ceramics Saturday", source: "concierge", createdAt: stamp(2, 20, 15), paymentId: "p4", status: "confirmed",
        items: [item("o12", 5, "11:00", 1, "confirmed")] },
      { id: "b5", code: "BLS-X9LP", userId: "u1", title: "Birthday night out", source: "concierge", createdAt: stamp(3, 16, 30), paymentId: "p5", status: "partial",
        items: [item("o5", 8, "21:30", 4, "confirmed"), item("o10", 8, "23:30", 4, "declined", { declineReason: "Fully booked for a private event", refunded: 360 })] },
      { id: "b6", code: "BLS-H2WK", userId: "u1", title: "Weekend in Neve Tzedek", source: "concierge", createdAt: stamp(7, 12, 0), paymentId: "p6", status: "confirmed",
        items: [item("o14", 11, "15:00", 2, "confirmed"), item("o4", 12, "11:00", 2, "confirmed")] },
      { id: "b7", code: "BLS-R5YO", userId: "u1", title: "Rooftop yoga", source: "direct", createdAt: stamp(4, 8, 0), paymentId: "p7", status: "cancelled", cancelledAt: stamp(2, 9, 30),
        items: [item("o8", 1, "18:15", 1, "cancelled")] },
      { id: "b8", code: "BLS-S1RF", userId: "u1", title: "Surf morning", source: "direct", createdAt: stamp(14, 19, 0), paymentId: "p8", status: "completed",
        items: [item("o16", -10, "08:00", 2, "redeemed", { redeemedAt: stamp(10, 8, 2) })] },
      { id: "b9", code: "BLS-B4HS", userId: "u1", title: "Bauhaus walk", source: "concierge", createdAt: stamp(20, 10, 0), paymentId: "p9", status: "completed",
        items: [item("o18", -17, "10:00", 2, "redeemed", { redeemedAt: stamp(17, 10, 5) })] },
      { id: "b10", code: "BLS-N6SB", userId: "u1", title: "Sound bath", source: "direct", createdAt: stamp(9, 21, 0), paymentId: "p10", status: "refunded",
        items: [item("o9", -6, "20:00", 1, "declined", { declineReason: "Teacher unwell, session cancelled", refunded: 120 })] },
      { id: "b11", code: "BLS-L3CH", userId: "u1", title: "Chef's counter lunch", source: "direct", createdAt: stamp(0, 8, 45), paymentId: "p11", status: "pending",
        items: [item("o2", 3, "13:00", 2, "pending")] },
      { id: "b12", code: "BLS-F7ST", userId: "u1", title: "Street art tour", source: "concierge", createdAt: stamp(1, 13, 20), paymentId: "p12", status: "confirmed",
        items: [item("o19", 6, "16:00", 3, "confirmed")] },
      { id: "b13", code: "BLS-D2SL", userId: "u2", title: "Sunset sail for two", source: "concierge", createdAt: stamp(0, 10, 5), paymentId: "p13", status: "pending",
        items: [item("o6", 2, "17:15", 2, "pending")] },
      { id: "b14", code: "BLS-N1TM", userId: "u3", title: "Anniversary dinner", source: "concierge", createdAt: stamp(2, 11, 0), paymentId: "p14", status: "confirmed",
        items: [item("o1", 1, "19:30", 2, "confirmed")] },
      { id: "b15", code: "BLS-O3MS", userId: "u4", title: "Massage after work", source: "direct", createdAt: stamp(3, 17, 0), paymentId: "p15", status: "completed",
        items: [item("o3", -2, "18:00", 1, "redeemed", { redeemedAt: stamp(2, 18, 1) })] },
      { id: "b16", code: "BLS-T5YT", userId: "u5", title: "Team day on the water", source: "concierge", createdAt: stamp(1, 15, 0), paymentId: "p16", status: "pending",
        items: [item("o7", 9, "14:00", 8, "pending"), item("o15", 9, "18:30", 8, "pending")] },
      { id: "b17", code: "BLS-Y6CL", userId: "u6", title: "Dinner at Claro", source: "direct", createdAt: stamp(0, 7, 30), paymentId: "p17", status: "pending",
        items: [item("o1", 5, "21:00", 2, "pending")] },
      { id: "b18", code: "BLS-S9LN", userId: "u7", title: "Lunch with clients", source: "direct", createdAt: stamp(4, 9, 0), paymentId: "p18", status: "confirmed",
        items: [item("o2", 1, "13:00", 4, "confirmed")] },
      { id: "b19", code: "BLS-H8GL", userId: "u9", title: "Glaze night", source: "direct", createdAt: stamp(2, 19, 0), paymentId: "p19", status: "confirmed",
        items: [item("o13", 4, "19:00", 2, "confirmed")] },
      { id: "b20", code: "BLS-L7CR", userId: "u10", title: "Counter lunch", source: "direct", createdAt: stamp(1, 12, 0), paymentId: "p20", status: "pending",
        items: [item("o2", 2, "12:30", 1, "pending")] },
    ];
    bookings.forEach((b) => { b.total = b.items.reduce((s, i) => s + i.price, 0); });

    const methods = ["Visa •• 4242", "Apple Pay", "Wallet", "Mastercard •• 8810"];
    const payments = bookings.map((b, i) => {
      const refunded = b.items.reduce((s, it) => s + (it.refunded || 0), 0);
      let status = "succeeded";
      if (b.status === "refunded") status = "refunded";
      else if (b.status === "cancelled") status = "refunded";
      else if (refunded > 0) status = "partially_refunded";
      return { id: b.paymentId, bookingId: b.id, userId: b.userId, amount: b.total, method: methods[i % methods.length], status, at: b.createdAt,
        refundAmount: b.status === "cancelled" ? b.total : refunded, kind: "booking" };
    });
    payments.push({ id: "p21", bookingId: null, userId: "u13", amount: 560, method: "Visa •• 1180", status: "failed", at: stamp(1, 22, 10), refundAmount: 0, kind: "booking", failReason: "Card declined by issuer" });
    payments.push({ id: "p22", bookingId: null, userId: "u1", amount: 280, method: "Visa •• 4242", status: "succeeded", at: stamp(1, 18, 25), refundAmount: 0, kind: "tickets", ticketId: "t1" });
    payments.push({ id: "p23", bookingId: null, userId: "u1", amount: 90, method: "Apple Pay", status: "succeeded", at: stamp(8, 9, 0), refundAmount: 0, kind: "tickets", ticketId: "t2" });

    const tickets = [
      { id: "t1", userId: "u1", eventId: "e1", qty: 2, status: "paid", code: "TKT-J4ZZ", paidAt: stamp(1, 18, 25), paymentId: "p22" },
      { id: "t2", userId: "u1", eventId: "e4", qty: 1, status: "paid", code: "TKT-WC8A", paidAt: stamp(8, 9, 0), paymentId: "p23" },
      { id: "t3", userId: "u1", eventId: "e2", qty: 2, status: "held", code: "TKT-SY2B", holdUntil: Date.now() + 9 * 60 * 1000 },
      { id: "t4", userId: "u1", eventId: "e8", qty: 2, status: "checked_in", code: "TKT-FM0D", paidAt: stamp(9, 10, 0), checkedInAt: stamp(4, 11, 22) },
      { id: "t5", userId: "u2", eventId: "e7", qty: 2, status: "paid", code: "TKT-RC11", paidAt: stamp(2, 10, 0) },
      { id: "t6", userId: "u3", eventId: "e7", qty: 1, status: "paid", code: "TKT-RC22", paidAt: stamp(3, 12, 0) },
      { id: "t7", userId: "u4", eventId: "e7", qty: 3, status: "paid", code: "TKT-RC33", paidAt: stamp(1, 16, 0) },
      { id: "t8", userId: "u5", eventId: "e7", qty: 2, status: "checked_in", code: "TKT-RC44", paidAt: stamp(5, 9, 0), checkedInAt: stamp(0, 19, 58) },
      { id: "t9", userId: "u9", eventId: "e1", qty: 2, status: "paid", code: "TKT-J4A1", paidAt: stamp(2, 20, 0) },
      { id: "t10", userId: "u7", eventId: "e1", qty: 4, status: "paid", code: "TKT-J4B2", paidAt: stamp(1, 11, 0) },
    ];

    const availability = [];
    const slotTimes = ["12:30", "13:30", "19:30", "21:00"];
    for (let d = 0; d < 7; d++) {
      slotTimes.forEach((t, ti) => {
        const booked = [0, 2, 4, 1, 3, 5, 2][(d + ti) % 7];
        availability.push({ id: `a${d}${ti}`, vendorId: "v1", date: day(d), time: t, capacity: 6, booked: Math.min(booked, 6), open: !(d === 1 && ti === 1) && !(d === 4 && ti === 3) });
      });
    }

    const supportThreads = [
      { id: "s1", userId: "u1", subject: "Move the massage to 18:00?", bookingId: "b1", status: "open", updatedAt: stamp(0, 8, 50), messages: [
        { from: "user", text: "Could the massage on Thursday move to 18:00? We'll be late from work.", at: stamp(0, 8, 42) },
        { from: "concierge", text: "Mantra Spa has 18:00 free on Thursday. Want me to move it and shift dinner to 20:30?", at: stamp(0, 8, 50) },
      ] },
      { id: "s2", userId: "u1", subject: "Refund for the DJ night", bookingId: "b5", status: "handed_off", updatedAt: stamp(2, 14, 20), messages: [
        { from: "user", text: "The rooftop declined but I still see the charge on my card.", at: stamp(2, 14, 0) },
        { from: "concierge", text: "The 360 ₪ refund went back to the card the same day. Banks show it in three to five working days. I'm bringing in a colleague to confirm.", at: stamp(2, 14, 5) },
        { from: "agent", text: "Hi Maya, Dana here. Confirmed on our side, reference RF-5120. If it's not there by Monday, reply here and I'll chase it.", at: stamp(2, 14, 20) },
      ] },
      { id: "s3", userId: "u1", subject: "Dietary note for the tasting menu", bookingId: "b1", status: "resolved", updatedAt: stamp(1, 19, 0), messages: [
        { from: "user", text: "One of us is pescatarian, can Claro adapt?", at: stamp(1, 18, 45) },
        { from: "concierge", text: "Done, the kitchen has it noted on the reservation.", at: stamp(1, 19, 0) },
      ] },
    ];

    const feedback = [
      { id: "f1", userId: "u1", bookingId: "b3", rating: 5, text: "The lamb was incredible and the table was ready on time.", at: stamp(3, 15, 0) },
      { id: "f2", userId: "u1", bookingId: "b8", rating: 4, text: "Great instructor, the wetsuit was a bit small.", at: stamp(10, 12, 0) },
      { id: "f3", userId: "u3", bookingId: "b14", rating: 5, text: "Perfect anniversary, thank you.", at: stamp(0, 9, 0) },
    ];

    const walletTx = [
      { id: "w1", type: "topup", amount: 500, title: "Top-up from Visa •• 4242", at: stamp(12, 9, 0) },
      { id: "w2", type: "payment", amount: -280, title: "Mezze lunch in Jaffa", at: stamp(5, 11, 0), bookingId: "b3" },
      { id: "w3", type: "refund", amount: 120, title: "Refund, Sound bath", at: stamp(6, 10, 0), bookingId: "b10" },
      { id: "w4", type: "points", amount: 0, points: 50, title: "Feedback bonus", at: stamp(3, 15, 0) },
      { id: "w5", type: "payment", amount: -80, title: "Rooftop yoga", at: stamp(4, 8, 0), bookingId: "b7" },
      { id: "w6", type: "refund", amount: 80, title: "Refund, Rooftop yoga", at: stamp(2, 9, 30), bookingId: "b7" },
    ];

    return {
      version: 4,
      role: "user",
      session: { userId: "u1", vendorId: "v1" },
      /* No budget on the profile: the concierge asks for one in chat when a plan needs it, and
         keeps it here only if the member says "remember this budget". `remembered` is that list. */
      profile: { name: "Maya Levi", phone: "+972 54 123 4567", email: "maya.levi@example.com", verified: true, onboarded: false,
        interests: ["Dining", "Wellness", "Sea & Outdoors"], budget: null, remembered: [], city: "Tel Aviv", area: "Florentin",
        subscription: { plan: "Plus", price: 49, renews: day(18), autoRenew: true }, points: 1240, walletBalance: 340,
        notifications: { push: true, email: true, whatsapp: false } },
      categories: [
        { id: "Dining", icon: "utensils" }, { id: "Wellness", icon: "leaf" }, { id: "Nightlife", icon: "moon" }, { id: "Sea & Outdoors", icon: "waves" },
        { id: "Culture", icon: "palette" }, { id: "Workshops", icon: "pot" }, { id: "Stays", icon: "bed" },
      ],
      vendors, offers, events, users, bookings, payments, tickets, availability, supportThreads, feedback, walletTx,
      plans: [],
      chat: { stage: 0, messages: [
        { from: "ai", text: "Hi Maya. Tell me what you want to do, when, and how many of you. If I need anything else, like a budget, I'll ask.", at: stamp(0, 8, 0) },
      ], draft: null, planId: null, frame: null, follow: null, noFollowUp: false, prefs: [], pendingMemory: null },
      log: [],
    };
  }

  /* ---------- store ---------- */
  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) { const s = JSON.parse(raw); if (s && s.version === 4) return s; }
    } catch (e) { /* fall through to a fresh seed */ }
    const s = seed();
    try { localStorage.setItem(KEY, JSON.stringify(s)); } catch (e) { /* private mode: keep in memory */ }
    return s;
  }
  const state = load();
  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { /* ignore */ }
    window.dispatchEvent(new CustomEvent("demo:changed"));
  }
  function reset() { localStorage.removeItem(KEY); location.reload(); }
  let seq = 100;
  const uid = (p) => `${p}${Date.now().toString(36)}${(seq++).toString(36)}`;
  const code = (p) => { const a = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; let s = ""; for (let i = 0; i < 4; i++) s += a[Math.floor(Math.random() * a.length)]; return `${p}-${s}`; };
  const nowIso = () => new Date().toISOString();

  /* ---------- formatting ---------- */
  const moneyFmt = new Intl.NumberFormat("en-IL", { style: "currency", currency: "ILS", maximumFractionDigits: 0 });
  const money = (n) => moneyFmt.format(Math.round(n || 0));
  /* Dates follow the language switch (assets/i18n.js). Money stays "₪1,200" in both, which is
     how Israeli prices are written either way. */
  const LOCALE = (window.BLI18N && window.BLI18N.lang === "he") ? "he-IL" : "en-GB";
  /* Hebrew short dates come back as "שבת, 10 באוק׳"; the comma breaks whenText, which keeps the first word, so rebuild from parts */
  const fmtShortRaw = new Intl.DateTimeFormat(LOCALE, { weekday: "short", day: "numeric", month: "short" });
  const fmtShort = LOCALE === "he-IL" ? { format: (d) => fmtShortRaw.formatToParts(d).filter((p) => p.type !== "literal").map((p) => p.value).join(" ") } : fmtShortRaw;
  const fmtLong = new Intl.DateTimeFormat(LOCALE, { weekday: "long", day: "numeric", month: "long" });
  const fmtNum = new Intl.DateTimeFormat(LOCALE, { day: "numeric", month: "short", year: "numeric" });
  const fmtTime = new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit" });
  const fmtStamp = new Intl.DateTimeFormat(LOCALE, { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
  function fdate(iso, style) {
    if (!iso) return "";
    const dt = parseIso(iso);
    const diff = Math.round((dt - TODAY) / 86400000);
    if (style === "rel" || !style) {
      if (diff === 0) return "Today";
      if (diff === 1) return "Tomorrow";
      if (diff === -1) return "Yesterday";
      return fmtShort.format(dt);
    }
    if (style === "long") return fmtLong.format(dt);
    if (style === "num") return fmtNum.format(dt);
    return fmtShort.format(dt);
  }
  const fstamp = (isoDt) => isoDt ? fmtStamp.format(new Date(isoDt)) : "";
  const ftime = (isoDt) => isoDt ? fmtTime.format(new Date(isoDt)) : "";
  const daysUntil = (iso) => Math.round((parseIso(iso) - TODAY) / 86400000);
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const qs = (k) => new URLSearchParams(location.search).get(k);
  const initials = (name) => (name || "?").split(/\s+/).slice(0, 2).map((w) => w[0]).join("").toUpperCase();
  const plural = (n, one, many) => `${n} ${n === 1 ? one : many || one + "s"}`;

  /* ---------- icons: one stroked family, 24 viewBox ---------- */
  const ICONS = {
    home: '<path d="M3 11.5 12 4l9 7.5"/><path d="M5 10v10h14V10"/>',
    chat: '<path d="M21 12a8 8 0 0 1-11.6 7.2L4 21l1.8-5.4A8 8 0 1 1 21 12z"/>',
    sparkles: '<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z"/><path d="M19 16l.7 2 2 .7-2 .7-.7 2-.7-2-2-.7 2-.7z"/>',
    sparkle: '<path d="M12 3c.6 5 3.9 8.4 9 9-5.1.6-8.4 4-9 9-.6-5-3.9-8.4-9-9 5.1-.6 8.4-4 9-9z"/>',
    calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>',
    ticket: '<path d="M3 9V7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v2a2 2 0 0 0 0 6v2a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-2a2 2 0 0 0 0-6z"/><path d="M12 5v14" stroke-dasharray="2 2"/>',
    user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
    users: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0M16 4.5a3.5 3.5 0 0 1 0 7M21.5 20a6.5 6.5 0 0 0-4.5-6.2"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
    "chevron-right": '<path d="m9 6 6 6-6 6"/>',
    "chevron-left": '<path d="m15 6-6 6 6 6"/>',
    "chevron-down": '<path d="m6 9 6 6 6-6"/>',
    "chevron-up": '<path d="m6 15 6-6 6 6"/>',
    x: '<path d="M6 6l12 12M18 6 6 18"/>',
    check: '<path d="m5 12 5 5 9-10"/>',
    "check-circle": '<circle cx="12" cy="12" r="9"/><path d="m8 12 3 3 5-6"/>',
    "x-circle": '<circle cx="12" cy="12" r="9"/><path d="m9 9 6 6M15 9l-6 6"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    minus: '<path d="M5 12h14"/>',
    mic: '<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/>',
    keyboard: '<rect x="3" y="7" width="18" height="11" rx="2"/><path d="M7 11h.01M11 11h.01M15 11h.01M8 15h8"/>',
    send: '<path d="m4 12 16-8-5 16-3-7z"/>',
    wallet: '<rect x="3" y="6" width="18" height="13" rx="2"/><path d="M3 10h18M16 14h2"/>',
    bell: '<path d="M6 16V11a6 6 0 0 1 12 0v5l1.5 2h-15z"/><path d="M10 20a2 2 0 0 0 4 0"/>',
    menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
    star: '<path d="m12 3 2.8 6 6.2.7-4.6 4.3 1.2 6.3L12 17l-5.6 3.3 1.2-6.3L3 9.7 9.2 9z"/>',
    pin: '<path d="M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.8-7 11-7 11z"/><circle cx="12" cy="10" r="2.5"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    refresh: '<path d="M20 12a8 8 0 1 1-2.3-5.7M20 4v5h-5"/>',
    logout: '<path d="M10 4H5v16h5M14 8l4 4-4 4M18 12H9"/>',
    settings: '<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M4.9 19.1 7 17M17 7l2.1-2.1"/>',
    shield: '<path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6z"/>',
    store: '<path d="M4 9 5.5 4h13L20 9M4 9v11h16V9M4 9h16M10 20v-6h4v6"/>',
    grid: '<rect x="4" y="4" width="7" height="7" rx="1.5"/><rect x="13" y="4" width="7" height="7" rx="1.5"/><rect x="4" y="13" width="7" height="7" rx="1.5"/><rect x="13" y="13" width="7" height="7" rx="1.5"/>',
    card: '<rect x="3" y="6" width="18" height="13" rx="2"/><path d="M3 10h18M7 15h4"/>',
    chart: '<path d="M4 20V10M10 20V4M16 20v-8M22 20H2"/>',
    qr: '<rect x="4" y="4" width="6" height="6"/><rect x="14" y="4" width="6" height="6"/><rect x="4" y="14" width="6" height="6"/><path d="M14 14h2v2h-2zM18 14h2M14 18h2M18 18h2v2"/>',
    scan: '<path d="M4 8V4h4M16 4h4v4M20 16v4h-4M8 20H4v-4M4 12h16"/>',
    trash: '<path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13M10 11v6M14 11v6"/>',
    edit: '<path d="M4 20h4l11-11-4-4L4 16zM13 7l4 4"/>',
    filter: '<path d="M4 5h16l-6 8v6l-4-2v-4z"/>',
    "arrow-right": '<path d="M4 12h16M14 6l6 6-6 6"/>',
    "arrow-left": '<path d="M20 12H4M10 6l-6 6 6 6"/>',
    info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/>',
    alert: '<path d="M12 3 2 20h20z"/><path d="M12 10v4M12 17h.01"/>',
    phone: '<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z"/>',
    mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
    music: '<path d="M9 18V6l11-2v12"/><circle cx="6" cy="18" r="3"/><circle cx="17" cy="16" r="3"/>',
    utensils: '<path d="M6 3v8a2 2 0 0 0 2 2v8M8 3v5M10 3v5M17 3c-2 0-3 3-3 6v3h3v9"/>',
    leaf: '<path d="M20 4C9 4 4 10 4 20c10 0 16-5 16-16z"/><path d="M4 20 14 10"/>',
    waves: '<path d="M2 9c2.5 0 2.5 2 5 2s2.5-2 5-2 2.5 2 5 2 2.5-2 5-2M2 16c2.5 0 2.5 2 5 2s2.5-2 5-2 2.5 2 5 2 2.5-2 5-2"/>',
    moon: '<path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5z"/>',
    palette: '<path d="M12 3a9 9 0 1 0 0 18c1.5 0 2-1 2-2s-1-2 0-3 2 0 3 0a4 4 0 0 0 4-4 9 9 0 0 0-9-9z"/><circle cx="7.5" cy="12" r="1"/><circle cx="10" cy="7.5" r="1"/><circle cx="15" cy="7.5" r="1"/>',
    pot: '<path d="M5 8h14l-1 12H6z"/><path d="M8 4h8M12 4v4"/>',
    bed: '<path d="M3 18V8M3 12h18v6M3 16h18M7 12V9h5v3"/>',
    heart: '<path d="M12 20s-8-5-8-11a4 4 0 0 1 8-1 4 4 0 0 1 8 1c0 6-8 11-8 11z"/>',
    download: '<path d="M12 4v11M7 10l5 5 5-5M4 20h16"/>',
    external: '<path d="M14 4h6v6M20 4l-9 9M18 14v6H4V6h6"/>',
    more: '<circle cx="5" cy="12" r="1.2"/><circle cx="12" cy="12" r="1.2"/><circle cx="19" cy="12" r="1.2"/>',
    eye: '<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
    lock: '<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',
    swap: '<path d="M4 8h13l-3-3M20 16H7l3 3"/>',
    tag: '<path d="M3 12V3h9l9 9-9 9z"/><circle cx="7.5" cy="7.5" r="1"/>',
    gift: '<rect x="3" y="9" width="18" height="12" rx="1"/><path d="M12 9v12M3 14h18M12 9c-2 0-5-1-5-3.5A2 2 0 0 1 11 5c1 1 1 4 1 4s0-3 1-4a2 2 0 0 1 4 .5C17 8 14 9 12 9z"/>',
    help: '<circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.7.3-1 .8-1 1.5M12 17h.01"/>',
    file: '<path d="M14 3H6v18h12V7z"/><path d="M14 3v4h4"/>',
    image: '<rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="8.5" cy="10" r="1.5"/><path d="m21 16-5-5-8 8"/>',
    copy: '<rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V5h10"/>',
    sliders: '<path d="M4 7h10M18 7h2M4 17h4M12 17h8"/><circle cx="16" cy="7" r="2"/><circle cx="10" cy="17" r="2"/>',
    receipt: '<path d="M6 3h12v18l-3-2-3 2-3-2-3 2z"/><path d="M9 8h6M9 12h6"/>',
    headset: '<path d="M4 14v-2a8 8 0 0 1 16 0v2"/><rect x="3" y="13" width="4" height="6" rx="1.5"/><rect x="17" y="13" width="4" height="6" rx="1.5"/><path d="M19 19a3 3 0 0 1-3 3h-3"/>',
    bolt: '<path d="M13 3 4 14h6l-1 7 9-11h-6z"/>',
    undo: '<path d="M9 14 4 9l5-5"/><path d="M4 9h10a6 6 0 0 1 0 12h-3"/>',
    ban: '<circle cx="12" cy="12" r="9"/><path d="m6 6 12 12"/>',
    globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/>',
    taxi: '<path d="M5 17H3v-5l2-5h9v10M14 9h4l3 4v4h-2"/><circle cx="7" cy="17" r="2"/><circle cx="17" cy="17" r="2"/>',
    percent: '<path d="M19 5 5 19"/><circle cx="7" cy="7" r="2"/><circle cx="17" cy="17" r="2"/>',
    trending: '<path d="m3 17 6-6 4 4 8-8M15 7h6v6"/>',
    layers: '<path d="m12 3 9 5-9 5-9-5z"/><path d="m3 13 9 5 9-5"/>',
    compass: '<circle cx="12" cy="12" r="9"/><path d="m15.5 8.5-2 5-5 2 2-5z"/>',
    flag: '<path d="M5 21V4h11l-1.5 4L16 12H5"/>',
    play: '<path d="M7 4v16l13-8z"/>',
    camera: '<path d="M4 8h3l2-3h6l2 3h3v12H4z"/><circle cx="12" cy="13" r="3.5"/>',
    phoneDevice: '<rect x="6" y="2" width="12" height="20" rx="3"/><path d="M10 18h4"/>',
    monitor: '<rect x="3" y="4" width="18" height="12" rx="2"/><path d="M8 20h8M12 16v4"/>',
    walk: '<circle cx="13" cy="4" r="1.5"/><path d="m8 21 3-7-2-3 1-5 3 1 2 3 3 1M14 14l2 2v5"/>',
  };
  const icon = (name, cls) => `<svg class="ic${cls ? " " + cls : ""}" viewBox="0 0 24 24" aria-hidden="true">${ICONS[name] || ICONS.info}</svg>`;

  /* ---------- lookups ---------- */
  const byId = (list) => (id) => list.find((x) => x.id === id);
  const offer = byId(state.offers);
  const vendor = byId(state.vendors);
  const event = byId(state.events);
  const booking = byId(state.bookings);
  const user = byId(state.users);
  const payment = byId(state.payments);
  const ticket = byId(state.tickets);
  const me = () => state.session.userId;
  const myBookings = () => state.bookings.filter((b) => b.userId === me());
  const myTickets = () => state.tickets.filter((t) => t.userId === me());
  const categoryIcon = (cat) => (state.categories.find((c) => c.id === cat) || { icon: "sparkle" }).icon;
  const itemPrice = (o, guests) => o.price * (o.unit === "per person" ? guests : 1);
  const vendorRating = (v) => v.rating ? `${v.rating.toFixed(1)} · ${v.reviews} reviews` : "New";
  const priceLevel = (n) => "₪".repeat(n);

  const STATUS = {
    pending: ["Awaiting vendor", "wait"], confirmed: ["Confirmed", "ok"], partial: ["Partly confirmed", "wait"], completed: ["Completed", ""],
    cancelled: ["Cancelled", "bad"], refunded: ["Refunded", "bad"], declined: ["Declined", "bad"], redeemed: ["Redeemed", ""],
    succeeded: ["Paid", "ok"], failed: ["Failed", "bad"], partially_refunded: ["Partly refunded", "wait"],
    active: ["Active", "ok"], paused: ["Paused", "wait"], draft: ["Draft", ""], suspended: ["Suspended", "bad"], invited: ["Invited", "wait"],
    on_sale: ["On sale", "ok"], sold_out: ["Sold out", "wait"], past: ["Past", ""], held: ["Held", "wait"], paid: ["Paid", "ok"],
    checked_in: ["Checked in", "ok"], released: ["Released", ""], open: ["Open", "wait"], handed_off: ["With an agent", "wait"], resolved: ["Resolved", "ok"],
    booked: ["Booked", "ok"],
  };
  const badge = (s) => { const [label, tone] = STATUS[s] || [s, ""]; return `<span class="badge${tone ? " badge-" + tone : ""}">${esc(label)}</span>`; };
  const statusLabel = (s) => (STATUS[s] || [s])[0];

  /* A plan is measured against the budget it was asked with (passed in), falling back to the one
     the member chose to remember. With neither there is nothing to measure, and the screens say
     so rather than inventing a range. */
  function budgetStatus(total, budget) {
    const b = budget || state.profile.budget;
    if (!b) return { key: "none", label: "No budget set yet", pct: 0, tone: "ok", flexTop: 0, ceiling: 0 };
    const flexTop = Math.round(b.normal[1] * (1 + b.flex / 100));
    const usual = !b.source || b.source === "profile";
    const said = b.source === "open" ? "I set" : "you gave";
    if (total <= b.normal[1]) return { key: "normal", label: usual ? "Within your usual range" : `Well within the ${money(b.ceiling)} ${said}`, pct: total / b.ceiling, tone: "ok", flexTop, ceiling: b.ceiling };
    if (total <= flexTop) return { key: "flex", label: usual ? `Within your ${b.flex}% flexibility margin` : `Near the top of the ${money(b.ceiling)} ${said}`, pct: total / b.ceiling, tone: "wait", flexTop, ceiling: b.ceiling };
    if (total <= b.ceiling) return { key: "stretch", label: usual ? "Above your usual range, under your ceiling" : `Close to the ${money(b.ceiling)} ${said}`, pct: total / b.ceiling, tone: "wait", flexTop, ceiling: b.ceiling };
    return { key: "over", label: usual ? "Over your ceiling" : `Over the ${money(b.ceiling)} ${said}`, pct: 1, tone: "bad", flexTop, ceiling: b.ceiling };
  }

  /* ---------- DOM helpers ---------- */
  function render(el, html) {
    el.innerHTML = html;
    Array.from(el.children).forEach((c, i) => c.style.setProperty("--i", Math.min(i, 14)));
  }
  function on(root, type, sel, fn) {
    root.addEventListener(type, (e) => { const t = e.target.closest(sel); if (t && root.contains(t)) fn(e, t); });
  }
  let toastHost;
  function toast(msg, ms) {
    if (!toastHost) { toastHost = document.createElement("div"); toastHost.className = "toasts"; toastHost.setAttribute("aria-live", "polite"); document.body.appendChild(toastHost); }
    const t = document.createElement("div"); t.className = "toast"; t.innerHTML = `${icon("check", "sm")}<span>${esc(msg)}</span>`;
    toastHost.appendChild(t);
    requestAnimationFrame(() => t.classList.add("is-in"));
    setTimeout(() => { t.classList.remove("is-in"); setTimeout(() => t.remove(), 260); }, ms || 2400);
  }
  function leave(el, cb) {
    el.style.maxHeight = el.offsetHeight + "px";
    requestAnimationFrame(() => { el.classList.add("leave"); el.style.maxHeight = "0"; el.style.marginTop = "0"; el.style.marginBottom = "0"; el.style.paddingTop = "0"; el.style.paddingBottom = "0"; });
    setTimeout(() => { el.remove(); if (cb) cb(); }, 250);
  }
  function countUp(el, to, fmt) {
    const from = Number(el.dataset.v || 0); const start = performance.now(); const dur = 500;
    const step = (t) => { const p = Math.min(1, (t - start) / dur); const e = 1 - Math.pow(1 - p, 3); const v = from + (to - from) * e; el.textContent = fmt ? fmt(Math.round(v)) : Math.round(v); if (p < 1) requestAnimationFrame(step); };
    el.dataset.v = to; requestAnimationFrame(step);
  }
  function qr(seedStr) {
    let h = 2166136261; for (const ch of seedStr) { h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619); }
    let cells = "";
    for (let y = 0; y < 21; y++) for (let x = 0; x < 21; x++) {
      const finder = (x < 7 && y < 7) || (x > 13 && y < 7) || (x < 7 && y > 13);
      let onCell;
      if (finder) { const fx = x % 14 < 7 ? x % 14 : x - 14, fy = y % 14 < 7 ? y % 14 : y - 14; const lx = x > 13 ? x - 14 : fx, ly = y > 13 ? y - 14 : fy; onCell = lx === 0 || lx === 6 || ly === 0 || ly === 6 || (lx >= 2 && lx <= 4 && ly >= 2 && ly <= 4); }
      else { h ^= (x * 31 + y * 17); h = Math.imul(h ^ (h >>> 13), 1274126177); onCell = ((h >>> 0) % 7) < 3; }
      cells += `<i class="${onCell ? "" : "off"}"></i>`;
    }
    return `<div class="qr" role="img" aria-label="Ticket code ${esc(seedStr)}">${cells}</div>`;
  }

  /* dialogs (web) and sheets (ios) share one API: {title, body, actions:[{label, kind, onClick(close)}]} */
  function dialog(opts) {
    const host = document.createElement("div"); host.className = "dialog is-open"; host.setAttribute("role", "dialog"); host.setAttribute("aria-modal", "true");
    host.innerHTML = `<div class="scrim"></div><div class="box${opts.wide ? " wide" : ""}">
      <button class="btn btn-ghost btn-icon btn-sm close" aria-label="Close">${icon("x")}</button>
      ${opts.title ? `<h2 class="mb-2 pr-8">${esc(opts.title)}</h2>` : ""}<div class="body text-ash text-sm">${opts.body || ""}</div>
      ${opts.actions && opts.actions.length ? `<div class="actions">${opts.actions.map((a, i) => `<button class="btn ${a.kind === "primary" ? "btn-primary" : a.kind === "danger" ? "btn-danger" : "btn-secondary"}" data-i="${i}">${esc(a.label)}</button>`).join("")}</div>` : ""}
    </div>`;
    document.body.appendChild(host);
    const close = () => { host.remove(); document.removeEventListener("keydown", onKey); };
    const onKey = (e) => { if (e.key === "Escape") close(); };
    document.addEventListener("keydown", onKey);
    host.querySelector(".scrim").addEventListener("click", close);
    host.querySelector(".close").addEventListener("click", close);
    host.querySelectorAll(".actions button").forEach((b) => b.addEventListener("click", () => { const a = opts.actions[b.dataset.i]; if (a.onClick) a.onClick(close, host); else close(); }));
    const first = host.querySelector(".body input, .body select, .body textarea, .actions .btn-primary, .actions button");
    if (first) first.focus();
    return { el: host, close };
  }
  function sheet(opts) {
    const host = document.createElement("div"); host.className = "sheet-host is-open"; host.setAttribute("role", "dialog"); host.setAttribute("aria-modal", "true");
    host.innerHTML = `<div class="scrim"></div><div class="sheet"><div class="grab"></div>
      ${opts.title ? `<h2>${esc(opts.title)}</h2>` : ""}<div class="body text-ash text-sm">${opts.body || ""}</div>
      ${opts.actions && opts.actions.length ? `<div class="actions">${opts.actions.map((a, i) => `<button class="btn btn-lg ${a.kind === "primary" ? "btn-primary" : a.kind === "danger" ? "btn-danger" : "btn-secondary"}" data-i="${i}">${esc(a.label)}</button>`).join("")}</div>` : ""}
    </div>`;
    document.body.appendChild(host);
    requestAnimationFrame(() => requestAnimationFrame(() => host.classList.add("is-in")));
    const close = () => { host.classList.remove("is-in"); host.classList.add("is-out"); document.removeEventListener("keydown", onKey); setTimeout(() => host.remove(), 220); };
    const onKey = (e) => { if (e.key === "Escape") close(); };
    document.addEventListener("keydown", onKey);
    host.querySelector(".scrim").addEventListener("click", close);
    host.querySelectorAll(".actions button").forEach((b) => b.addEventListener("click", () => { const a = opts.actions[b.dataset.i]; if (a.onClick) a.onClick(close, host); else close(); }));
    return { el: host, close };
  }
  const modal = (opts) => (document.body.classList.contains("ios") ? sheet(opts) : dialog(opts));
  function confirm(opts) {
    return new Promise((resolve) => {
      let done = false;
      const m = modal({ title: opts.title, body: `<p>${opts.body || ""}</p>`, actions: [
        { label: opts.ok || "Confirm", kind: opts.danger ? "danger" : "primary", onClick: (close) => { done = true; close(); resolve(true); } },
        { label: opts.cancel || "Keep it", kind: "secondary", onClick: (close) => { close(); resolve(false); } },
      ] });
      m.el.querySelector(".scrim").addEventListener("click", () => { if (!done) resolve(false); });
    });
  }

  /* ---------- iOS shell ---------- */
  const IOS_TABS = [
    ["home", "Home", "home.html", "home"], ["concierge", "Concierge", "concierge.html", "sparkle"],
    ["bookings", "Bookings", "bookings.html", "calendar"], ["events", "Events", "events.html", "ticket"], ["profile", "Profile", "profile.html", "user"],
  ];
  function iosShell(o) {
    document.documentElement.classList.add("ios"); document.body.classList.add("ios");
    const scroll = document.querySelector(".scroll");
    const sb = document.createElement("div"); sb.className = "statusbar"; sb.setAttribute("aria-hidden", "true");
    sb.innerHTML = `<span>9:41</span><span class="sig"><svg width="18" height="12" viewBox="0 0 18 12" fill="#ededed"><rect x="0" y="8" width="3" height="4" rx="1"/><rect x="5" y="5" width="3" height="7" rx="1"/><rect x="10" y="2.5" width="3" height="9.5" rx="1"/><rect x="15" y="0" width="3" height="12" rx="1"/></svg><svg width="16" height="12" viewBox="0 0 16 12" fill="none" stroke="#ededed" stroke-width="1.6" stroke-linecap="round"><path d="M1 4.5a10 10 0 0 1 14 0M3.5 7a6.5 6.5 0 0 1 9 0M6 9.5a3 3 0 0 1 4 0"/></svg><span class="bat"><i></i></span></span>`;
    const nav = document.createElement("div"); nav.className = "navbar" + (o.large ? "" : " always");
    const backHtml = o.back ? `<button class="back" data-back="${esc(o.back)}">${icon("chevron-left")}<span>${esc(o.backLabel || "Back")}</span></button>` : "";
    nav.innerHTML = `<div class="left">${backHtml}</div><div class="nav-title">${esc(o.title || "")}</div><div class="rightside">${o.right || ""}</div>`;
    document.body.prepend(nav); document.body.prepend(sb);
    document.title = `${o.title || "Dusk"} · Dusk`;
    if (!document.querySelector('meta[name="theme-color"]')) { const m = document.createElement("meta"); m.name = "theme-color"; m.content = "#0a0a0a"; document.head.appendChild(m); }
    if (scroll) {
      if (!o.tab) scroll.classList.add("no-tabs");
      if (o.back) scroll.classList.add("screen-push"); else scroll.classList.add("screen");
      scroll.addEventListener("scroll", () => nav.classList.toggle("is-scrolled", scroll.scrollTop > 24), { passive: true });
    }
    if (o.tab) {
      const tb = document.createElement("nav"); tb.className = "tabbar"; tb.setAttribute("aria-label", "Main");
      tb.innerHTML = IOS_TABS.map(([k, l, h, ic]) => `<a href="${h}" class="${k === o.tab ? "is-active" : ""}" ${k === o.tab ? 'aria-current="page"' : ""}>${icon(ic)}<span>${l}</span></a>`).join("");
      document.body.appendChild(tb);
    }
    const hi = document.createElement("div"); hi.className = "home-ind"; hi.setAttribute("aria-hidden", "true"); document.body.appendChild(hi);
    const back = nav.querySelector(".back");
    if (back) back.addEventListener("click", () => { if (o.backHard || history.length <= 1) location.href = o.back; else history.back(); });
  }

  /* ---------- web shell ---------- */
  // The web app is the Vendor Portal and the Back Office only. A member lives on the phone, so
  // there is no member role here: the sign-in page and the sidebar offer vendor and admin, and
  // a role saved by an older session that the shell does not know falls back to vendor.
  const WEB_NAV = {
    vendor: [["dashboard", "Dashboard", "vendor-dashboard.html", "grid"], ["bookings", "Bookings", "vendor-bookings.html", "calendar"], ["availability", "Availability", "vendor-availability.html", "clock"], ["redemption", "Redemption", "vendor-redemption.html", "qr"], ["offers", "Offers", "vendor-offers.html", "tag"], ["checkin", "Check-in", "checkin.html", "scan"]],
    admin: [["dashboard", "Dashboard", "admin-dashboard.html", "grid"], ["users", "Users", "admin-users.html", "users"], ["vendors", "Vendors", "admin-vendors.html", "store"], ["catalog", "Catalog", "admin-catalog.html", "layers"], ["bookings", "Bookings", "admin-bookings.html", "calendar"], ["payments", "Payments", "admin-payments.html", "card"], ["reports", "Reports", "admin-reports.html", "chart"]],
  };
  const ROLE_HOME = { vendor: "vendor-dashboard.html", admin: "admin-dashboard.html" };
  const ROLE_LABEL = { vendor: "Vendor", admin: "Admin" };
  const SEARCH_TARGET = { vendor: "vendor-bookings.html", admin: "admin-bookings.html" };
  function webShell(o) {
    const wanted = o.role || state.role;
    const role = WEB_NAV[wanted] ? wanted : "vendor";
    if (state.role !== role) { state.role = role; save(); }
    const whoName = role === "vendor" ? vendor(state.session.vendorId).contact.name : "Dana Weiss";
    const side = document.createElement("aside"); side.className = "sidebar"; side.id = "sidebar"; side.setAttribute("aria-label", "Sidebar");
    side.innerHTML = `<div class="brand"><span class="mark">${icon("sparkles", "sm")}</span><span>Dusk</span><button class="btn btn-ghost btn-icon btn-sm ml-auto lg:hidden" data-close-menu aria-label="Close menu">${icon("x")}</button></div>
      <nav aria-label="Primary">${WEB_NAV[role].map(([k, l, h, ic]) => `<a href="${h}" class="${k === o.active ? "is-active" : ""}" ${k === o.active ? 'aria-current="page"' : ""}>${icon(ic)}<span>${l}</span></a>`).join("")}</nav>
      <div class="foot">
        <div class="role"><label class="label" for="roleSwitch">Viewing as</label>
          <select class="select" id="roleSwitch" name="role" aria-label="Switch role">${["vendor", "admin"].map((r) => `<option value="${r}" ${r === role ? "selected" : ""}>${ROLE_LABEL[r]}</option>`).join("")}</select></div>
        <div class="seg" role="group" aria-label="Language"><button data-lang="en" aria-pressed="false" translate="no" lang="en">English</button><button data-lang="he" aria-pressed="false" translate="no" lang="he">עברית</button></div>
        <button class="btn btn-ghost btn-sm justify-start" data-reset>${icon("refresh", "sm")}<span>Reset demo data</span></button>
        <a class="btn btn-ghost btn-sm justify-start" href="../ios/home.html">${icon("phoneDevice", "sm")}<span>Open the mobile app</span></a>
        <a class="btn btn-ghost btn-sm justify-start" href="../index.html">${icon("logout", "sm")}<span>Sign out</span></a>
      </div>`;
    const bd = document.createElement("div"); bd.className = "backdrop"; bd.setAttribute("aria-hidden", "true");
    const main = document.querySelector(".web-main");
    main.parentNode.insertBefore(side, main); main.parentNode.insertBefore(bd, main);
    const top = document.createElement("header"); top.className = "topbar";
    top.innerHTML = `<button class="btn btn-ghost btn-icon menu-btn" data-open-menu aria-label="Open menu" aria-controls="sidebar">${icon("menu")}</button>
      <h1>${esc(o.title || "")}</h1>
      <form class="search" role="search" data-search><div class="input-wrap">${icon("search", "sm")}<input class="input" type="search" name="q" placeholder="${esc(o.searchHint || "Search…")}" aria-label="Search" autocomplete="off"></div></form>
      <button class="btn btn-ghost btn-icon md:hidden" data-search-btn aria-label="Search">${icon("search")}</button>
      <div class="who"><span>${esc(whoName)}</span><div class="avatar sm" aria-hidden="true">${initials(whoName)}</div></div>`;
    main.prepend(top);
    main.classList.add("screen");
    document.title = `${o.title || "Dusk"} · ${ROLE_LABEL[role]} · Dusk`;
    if (!document.querySelector('meta[name="theme-color"]')) { const m = document.createElement("meta"); m.name = "theme-color"; m.content = "#0a0a0a"; document.head.appendChild(m); }
    const openMenu = () => { side.classList.add("is-open"); bd.classList.add("is-open"); };
    const closeMenu = () => { side.classList.remove("is-open"); bd.classList.remove("is-open"); };
    top.querySelector("[data-open-menu]").addEventListener("click", openMenu);
    side.querySelector("[data-close-menu]").addEventListener("click", closeMenu);
    bd.addEventListener("click", closeMenu);
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeMenu(); });
    side.querySelectorAll("nav a").forEach((a) => a.addEventListener("click", closeMenu));
    side.querySelector("#roleSwitch").addEventListener("change", (e) => { state.role = e.target.value; save(); location.href = ROLE_HOME[state.role]; });
    side.querySelector("[data-reset]").addEventListener("click", async () => { if (await confirm({ title: "Reset demo data?", body: "Every booking, ticket and change made in this session goes back to the seeded state.", ok: "Reset", danger: true })) reset(); });
    const form = top.querySelector("[data-search]");
    form.addEventListener("submit", (e) => { e.preventDefault(); const q = form.q.value.trim(); if (o.onSearch) o.onSearch(q); else location.href = `${SEARCH_TARGET[role]}?q=${encodeURIComponent(q)}`; });
    top.querySelector("[data-search-btn]").addEventListener("click", () => { form.style.display = "block"; form.style.flex = "1 1 auto"; form.q.focus(); });
    const q = qs("q"); if (q) form.q.value = q;
    document.querySelector(".page")?.insertAdjacentHTML("afterbegin", `<a class="skip" href="#content">Skip to content</a>`);
    return { openMenu, closeMenu };
  }

  /* ---------- concierge ----------
     Follows uploads/AI_COMPANION_BOOKING_ARCHITECTURE.md. A request becomes a frame (what, when,
     who, budget, must-haves, things to avoid); the catalogue is searched and ranked
     (fit + quality + reliability + personal − travel − price); and the answer is sized to the ask:
     one pick with two or three options that differ, a short bundle, or a day-by-day trip with a
     budget sheet. Every price, slot and hold still comes from the demo catalogue, never invented. */
  const DAYS = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
  const NUMS = { one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, ten: 10 };
  // Walking distance from the member's home area (Florentin). A vendor connector would geocode this.
  const KM = { Florentin: 0.3, Levinsky: 0.5, "Neve Tzedek": 1.1, Allenby: 1.4, Rothschild: 1.6, "Jaffa Flea Market": 1.8, Jaffa: 2.0, "White City": 2.2, "Jaffa Port": 2.3, Sarona: 2.6, "Gordon Beach": 3.4 };
  // Soft attributes the catalogue would carry per offer; the seed keeps them here so ranking has something to weigh.
  const TRAITS = {
    o1: ["romantic", "quiet", "candlelit", "set menu", "deposit", "evening"], o2: ["casual", "quick", "daytime", "veg"], o3: ["relaxed", "quiet"], o4: ["romantic", "relaxed", "quiet", "upgrade"],
    o5: ["lively", "loud", "group", "late", "celebration"], o6: ["romantic", "sunset", "sea", "view", "evening"], o7: ["group", "private", "upgrade", "sea", "celebration"], o8: ["relaxed", "outdoor", "group", "sunset"],
    o9: ["relaxed", "quiet"], o10: ["loud", "lively", "late", "group", "crowded", "celebration"], o11: ["quiet", "evening"], o12: ["hands-on", "daytime", "group", "active"], o13: ["hands-on", "evening", "romantic"],
    o14: ["romantic", "quiet", "pool", "business"], o15: ["casual", "lively", "loud", "group", "veg", "crowded"], o16: ["active", "morning", "daytime", "group"], o17: ["active", "quiet", "sunrise", "daytime"],
    o18: ["daytime", "walk", "business"], o19: ["daytime", "walk", "group", "casual"],
  };
  const TRAIT_WORDS = { quiet: "quiet tables", candlelit: "candlelit", lively: "livelier", loud: "music after 9", romantic: "made for a date", sunset: "sunset light", sea: "on the water", view: "sea view", group: "good for a group", private: "all yours", "set menu": "set menu", late: "runs late", "hands-on": "hands-on", outdoor: "outdoors", pool: "pool and garden", veg: "vegetarian-friendly", upgrade: "the full treatment", crowded: "gets busy", relaxed: "slow and calm", casual: "easy and casual" };
  // How each category holds, charges and follows up, from the booking table in the architecture doc.
  const SHAPE = {
    Dining: { hold: "Table slot held", pay: "No deposit", after: "Reminder the day before", cancel: "Free cancellation until 24 h before" },
    Wellness: { hold: "Treatment slot held", pay: "Pay now or at the venue", after: "Reminder the day before", cancel: "Free cancellation until 24 h before" },
    Stays: { hold: "Rate held, re-quoted at payment", pay: "Charged through the payment provider", after: "Voucher in your wallet", cancel: "Per the hotel, free until 48 h before" },
    Nightlife: { hold: "Entry held for 10 minutes", pay: "Pay now", after: "QR pass in your wallet", cancel: "Non-refundable on the day" },
    "Sea & Outdoors": { hold: "Seats held for 10 minutes", pay: "Pay now", after: "QR pass in your wallet", cancel: "Weather cancellations refunded in full" },
    Workshops: { hold: "Seat held", pay: "Pay now", after: "Reminder the day before", cancel: "Free cancellation until 48 h before" },
    Culture: { hold: "Seats held for 10 minutes", pay: "Pay now", after: "QR pass in your wallet", cancel: "Non-refundable on the day" },
  };
  function bookingShape(o) {
    const s = SHAPE[vendor(o.vendorId).category] || SHAPE.Dining;
    const deposit = (TRAITS[o.id] || []).includes("deposit");
    return { hold: s.hold, pay: deposit ? "Deposit now, the rest at the table" : s.pay, after: s.after, cancel: s.cancel, wallet: /wallet/.test(s.after) };
  }
  const toMin = (hhmm) => { const [h, m] = hhmm.split(":").map(Number); return h * 60 + m; };
  const toHH = (min) => { const m = ((min % 1440) + 1440) % 1440; return `${pad(Math.floor(m / 60))}:${pad(m % 60)}`; };
  const SLOT = { Wellness: ["17:30", 60], "Sea & Outdoors": ["17:15", 120], Dining: ["20:00", 150], Nightlife: ["22:45", 120], Workshops: ["17:00", 120], Culture: ["18:30", 120], Stays: ["15:00", 0] };
  const SLOT_DAY = { "Sea & Outdoors": ["08:00", 90], Wellness: ["10:00", 60], Culture: ["10:30", 150], Dining: ["13:00", 90], Workshops: ["15:00", 120], Nightlife: ["21:00", 120], Stays: ["15:00", 0] };
  const FOLLOW = { Dining: ["Nightlife", "a quiet bar nearby after"], Wellness: ["Dining", "a table nearby after"], Stays: ["Dining", "a dinner table near the hotel"], Nightlife: ["Dining", "dinner before"], "Sea & Outdoors": ["Dining", "dinner by the port after"], Culture: ["Dining", "dinner before it"], Workshops: ["Dining", "dinner after"] };

  /* A request frame. Fields carry where the value came from (said, profile, assumed) so the reply
     can say what was assumed, as the doc asks, instead of asking a question whose answer would not
     change the result. */
  function parseRequest(text) {
    const t = text.toLowerCase().replace(/[’']/g, "'");
    const prof = state.profile;
    let guests = 2, partySrc = "assumed";
    const gm = t.match(/\b(?:for|party of|we are|we're|there are)\s+(\d{1,2}|one|two|three|four|five|six|seven|eight|ten)\b(?!\s*(?:days?|nights?|hours?|pm|am|weeks?))/) || t.match(/\b(\d{1,2}|two|three|four|five|six|seven|eight|ten)\s+(?:of us|people|guests|friends|colleagues|adults)\b/);
    if (gm) { guests = NUMS[gm[1]] || Number(gm[1]); partySrc = "said"; }
    else if (/\b(alone|solo|just me|myself|for one|on my own)\b/.test(t)) { guests = 1; partySrc = "said"; }
    else if (/\b(team|group|the gang|colleagues|friends|everyone)\b/.test(t)) { guests = 6; partySrc = "said"; }
    else if (/\b(girlfriend|boyfriend|partner|wife|husband|date night|the two of us|couple|anniversary)\b/.test(t)) { guests = 2; partySrc = "said"; }
    guests = Math.max(1, Math.min(12, guests || 2));
    let offset = null, whenSrc = "said";
    const fri = ((5 - TODAY.getDay() + 7) % 7) || 7;
    if (/tonight|today|this evening|right now/.test(t)) offset = 0;
    else if (/tomorrow/.test(t)) offset = 1;
    else if (/next weekend/.test(t)) offset = fri + 7;
    else if (/weekend/.test(t)) offset = fri;
    else DAYS.forEach((d, i) => { if (t.includes(d)) offset = ((i - TODAY.getDay() + 7) % 7) || 7; });
    if (offset === null && /next week/.test(t)) offset = 7;
    if (offset === null && /in two weeks|in 2 weeks/.test(t)) offset = 14;
    if (offset === null) { offset = 2; whenSrc = "assumed"; }
    const daytime = /morning|brunch|lunch|daytime|afternoon|sunrise|day out/.test(t) && !/evening|night|dinner/.test(t);
    let nights = 0;
    const nm = t.match(/\b(\d|two|three|four|five)\s*[- ]?(nights?|days?)\b/);
    if (nm) { const n = NUMS[nm[1]] || Number(nm[1]); nights = nm[2].startsWith("night") ? n : Math.max(1, n - 1); }
    if (!nights && /weekend away|getaway|trip|couple of days|overnight|night away|few days/.test(t)) nights = /weekend away|getaway|trip|few days/.test(t) ? 2 : 1;
    nights = Math.min(3, nights);
    const wants = [];
    const add = (c) => { if (!wants.includes(c)) wants.push(c); };
    if (/spa|massage|relax|wellness|unwind|hammam|yoga|sound bath|breath/.test(t)) add("Wellness");
    if (/\bsea\b|sail|boat|yacht|beach|surf|sunset|paddle|on the water|\bsup\b/.test(t)) add("Sea & Outdoors");
    if (/dinner|dining|\beat\b|food|restaurant|lunch|tasting|mezze|hungry|table|candle|brunch/.test(t)) add("Dining");
    if (/drinks?|cocktail|\bbars?\b|party|dance|\bdj\b|late|club|nightlife/.test(t)) add("Nightlife");
    if (/ceramic|pottery|workshop|class|make something|hands/.test(t)) add("Workshops");
    if (/museum|tour|\bart\b|culture|theatre|theater|show|walk|bauhaus|architecture|jazz|concert|gig/.test(t)) add("Culture");
    if (/hotel|\bstay\b|suite|sleep|weekend away|overnight|night away|getaway|trip/.test(t)) add("Stays");
    const exclude = [];
    [[/no (bars?|drinks|nightlife|clubs?)|skip the bar|not drinking|without drinks/, "Nightlife"], [/no spa|skip the spa|no massage/, "Wellness"], [/no dinner|skip dinner|already eaten|eaten already|without dinner/, "Dining"], [/no hotel|no stay|not staying/, "Stays"]]
      .forEach(([re, c]) => { if (re.test(t)) { exclude.push(c); const i = wants.indexOf(c); if (i >= 0) wants.splice(i, 1); } });
    const avoid = [];
    if (/not (too )?loud|nothing loud|no music|quiet|calm|low[- ]?key|not crowded|no crowds|crowded|somewhere still/.test(t)) avoid.push("loud", "crowded");
    let purpose = "casual";
    if (/anniversary|romantic|candle|date night|girlfriend|boyfriend|partner|wife|husband|proposal/.test(t)) purpose = "romantic";
    else if (/birthday|celebrat|party|promotion|big night/.test(t)) purpose = "celebration";
    else if (/relax|unwind|calm|quiet|slow|recover|chill|easy/.test(t)) purpose = "relaxed";
    else if (/client|business|meeting|colleague|\bwork\b|offsite|team/.test(t)) purpose = "business";
    else if (/active|surf|sail|paddle|hike|sport|energetic/.test(t)) purpose = "active";
    const must = [];
    if (/candle/.test(t)) must.push("candlelit");
    if (/sea view|by the sea|on the water|\bview\b/.test(t)) must.push("view");
    if (/vegetarian|vegan|\bveg\b/.test(t)) must.push("veg");
    if (/private/.test(t)) must.push("private");
    if (/quiet/.test(t)) must.push("quiet");
    /* The budget is never a form. It comes from this message, from an earlier answer the member
       chose to keep, or it is asked for, once, when the plan needs one. */
    let budget = null;
    const bm = t.match(/(?:budget|under|up to|max(?:imum)?|around|about|spend|roughly|cap)\s*(?:of|is|at)?\s*₪?\s*(\d[\d,]{2,5})\b/) || t.match(/₪\s*(\d[\d,]{2,5})/) || t.match(/\b(\d[\d,]{2,5})\s*(?:shekels?|nis|ils|₪)/);
    if (bm) budget = saidBudget(Number(bm[1].replace(/,/g, "")));
    else if (/surprise me|no limit|open budget|whatever it costs|don'?t mind|doesn'?t matter|no budget|not fussed|up to you|leave it open|you choose/.test(t)) budget = openBudget(nights, guests);
    else if (prof.budget) budget = Object.assign({ source: "profile" }, prof.budget);
    let anchor = null;
    const am = t.match(/\b(before|after)\s+(?:the\s+|our\s+|my\s+)?([a-z][a-z ]{2,30})/);
    if (am) {
      const words = am[2].trim().split(" ").filter((w) => w.length > 3 && !["night", "evening", "show", "event", "thing"].includes(w));
      const hit = myTickets().filter((x) => x.status === "paid" || x.status === "held").map((x) => ({ x, e: event(x.eventId) })).find(({ e }) => e && daysUntil(e.date) >= 0 && words.some((w) => e.title.toLowerCase().includes(w)));
      if (hit) { anchor = { rel: am[1], eventId: hit.e.id, ticketId: hit.x.id }; offset = daysUntil(hit.e.date); whenSrc = "said"; if (!/museum|tour|walk|show|theatre|theater|exhibition/.test(t)) { const i = wants.indexOf("Culture"); if (i >= 0) wants.splice(i, 1); } }
    }
    const travel = /walk/.test(t) ? "walk" : /taxi|cab|drive|car\b/.test(t) ? "taxi" : null;
    let scope = wants.length === 1 ? "single" : "bundle";
    if (/\b(evening|night out|day out|something to do|plan (my|an|the|a)|put together|and then|then|after that|followed by)\b/.test(t) && !nights) scope = "bundle";
    if (wants.length === 1 && /\b(just|only)\b/.test(t)) scope = "single";
    if (wants.length >= 2) scope = "bundle";
    if (nights > 0) scope = "trip";
    const vague = (!wants.length && !/evening|night|day\b|tonight|tomorrow|weekend|something|plan|surprise/.test(t)) || /^(hi|hello|hey|shalom|yo|help|what can you do|thanks|thank you)\b/.test(t);
    const frame = { text, intent: nights ? "plan" : scope === "single" ? "recommend" : "plan", scope, categories: wants.slice(), wants, purpose, guests, party: { guests, source: partySrc }, offset, when: { offset, daytime, source: whenSrc }, daytime, nights, budget, must, avoid, exclude, anchor, travel, vague, missing: [] };
    frame.missing = missingFor(frame);
    return frame;
  }
  function saidBudget(cap) { return { normal: [Math.round(cap * 0.6), Math.round(cap * 0.85)], flex: (state.profile.budget && state.profile.budget.flex) || 15, ceiling: cap, source: "said" }; }
  /* "Surprise me": a sensible cap for the size of the ask, said out loud in the reply so it is never a silent assumption. */
  function openBudget(nights, guests) { const cap = nights ? 3000 * (nights + 1) : 900 * Math.max(1, guests || 2); return { normal: [Math.round(cap * 0.6), Math.round(cap * 0.85)], flex: 15, ceiling: cap, source: "open" }; }
  /* What still has to be asked, in the order it is asked: what, then dates for a trip, then money. */
  function missingFor(f) {
    if (f.vague) return ["what"];
    const m = [];
    if (f.scope === "trip" && f.when.source === "assumed") m.push("when");
    /* A remembered budget covers an evening; a trip is a different size of spend, so it is asked again. */
    if (!f.budget || (f.scope === "trip" && f.budget.source === "profile")) m.push("budget");
    return m;
  }

  /* ---- search and rank ---- */
  function candidates(cat, except) {
    return state.offers.filter((o) => o.status === "active" && vendor(o.vendorId).category === cat && vendor(o.vendorId).status === "active" && !(except || []).includes(o.id));
  }
  const isFresh = (v) => daysUntil(v.joined) > -180;
  function scoreOffer(o, frame, share) {
    const v = vendor(o.vendorId); const tr = TRAITS[o.id] || []; const price = itemPrice(o, frame.guests);
    let fit = 0;
    frame.must.forEach((m) => { fit += tr.includes(m) ? 1 : -1; });
    if (tr.includes(frame.purpose)) fit += 0.6;
    if (frame.avoid.some((a) => tr.includes(a))) fit -= 1.2;
    const dayish = tr.includes("daytime") || tr.includes("morning") || tr.includes("sunrise");
    if (frame.daytime ? dayish : !dayish) fit += 0.4;
    if (frame.guests >= 4 && tr.includes("group")) fit += 0.4;
    if ((frame.guests >= 4 || frame.guests === 1) && o.unit === "per couple") fit -= 2;
    const quality = (v.rating - 4) * 0.8;
    const fresh = isFresh(v);
    const reliability = fresh ? 0.1 : v.reviews >= 300 ? 0.4 : 0.25;
    let personal = 0;
    if (state.profile.interests.includes(v.category)) personal += 0.2;
    if (myBookings().some((b) => b.items.some((i) => i.vendorId === v.id && (i.status === "redeemed" || i.status === "confirmed")))) personal += 0.2;
    (state.profile.remembered || []).forEach((r) => { if (r.trait && tr.includes(r.trait)) personal += 0.3; if (r.avoid && tr.includes(r.avoid)) personal -= 1; });
    const km = KM[v.area] || 2; const travel = km * 0.08;
    const bud = frame.budget || openBudget(frame.nights, frame.guests); const hi = bud.normal[1] * share, ceil = bud.ceiling * share, flexTop = hi * (1 + bud.flex / 100);
    const band = price > ceil ? "over" : price > flexTop ? "stretch" : price > hi ? "flex" : "normal";
    const pricePenalty = { over: 9, stretch: 0.8, flex: 0.3, normal: 0 }[band];
    return { offer: o, vendor: v, price, score: fit + quality + reliability + personal - travel - pricePenalty, km, fresh, band, overCeiling: band === "over", traits: tr, ceil };
  }
  function rank(cat, frame, share, except) { return candidates(cat, except).map((o) => scoreOffer(o, frame, share)).sort((a, b) => b.score - a.score); }
  /* Top three that differ: the best fit, a better-value option under it, and an upgrade above it. */
  function shortlist(cat, frame, share, except) {
    const all = rank(cat, frame, share || 1, except);
    const inBudget = all.filter((r) => !r.overCeiling);
    const pool = inBudget.length ? inBudget : all.slice(0, 2);
    const best = pool[0]; if (!best) return [];
    const out = [Object.assign(best, { label: "Best fit" })];
    const value = pool.find((r) => r !== best && r.price < best.price);
    if (value) out.push(Object.assign(value, { label: "Better value" }));
    const up = pool.find((r) => !out.includes(r) && r.price > best.price);
    if (up) out.push(Object.assign(up, { label: "Special-occasion upgrade" }));
    if (out.length < 3) { const next = pool.find((r) => !out.includes(r)); if (next) out.push(Object.assign(next, { label: "Also good" })); }
    return out.slice(0, 3).map((r) => Object.assign(r, { line: tradeoff(r, frame, best), why: reasonFor(r, frame) }));
  }
  function tradeoff(r, frame, best) {
    const parts = [r.overCeiling ? "Over your ceiling" : r.label];
    if (r.fresh) parts.push("newly added; reviewed by our team");
    parts.push(`${r.km.toFixed(1)} km`);
    if (r.label === "Better value" && best) parts.push(`${money(best.price - r.price)} less`);
    if (r.band === "flex") parts.push("near the top of the budget"); else if (r.band === "stretch") parts.push("close to the cap");
    const words = [...frame.must, frame.purpose, ...r.traits].filter((x, i, a) => r.traits.includes(x) && TRAIT_WORDS[x] && a.indexOf(x) === i).slice(0, 2).map((x) => TRAIT_WORDS[x]);
    parts.push(...words);
    const sh = bookingShape(r.offer); parts.push(sh.pay.toLowerCase()); parts.push(sh.cancel.toLowerCase());
    return parts.slice(0, 6).join(" · ");
  }
  function reasonFor(r, frame) {
    const o = r.offer, v = r.vendor;
    const bits = [];
    const wants = [...frame.must, frame.purpose].filter((x) => r.traits.includes(x) && TRAIT_WORDS[x]);
    if (wants.length) bits.push(wants.map((x) => TRAIT_WORDS[x]).join(" and "));
    else if (r.traits[0] && TRAIT_WORDS[r.traits[0]]) bits.push(TRAIT_WORDS[r.traits[0]]);
    bits.push(r.km <= 1.2 ? "a short walk from home" : `${r.km.toFixed(1)} km away`);
    bits.push(v.rating >= 4.8 ? `rated ${v.rating} by ${v.reviews} members` : `${v.reviews} reviews`);
    return `${o.title} at ${v.name}: ${bits.join(", ")}.`;
  }
  const whenText = (frame) => frame.offset === 0 ? "tonight" : frame.offset === 1 ? "tomorrow" : fdate(day(frame.offset), "short").split(" ")[0];
  const whenLong = (frame) => frame.offset === 0 ? "tonight" : frame.offset === 1 ? "tomorrow" : `on ${fdate(day(frame.offset), "short")}`;
  const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
  const partyText = (n) => n === 1 ? "one person" : n === 2 ? "two people" : `${n} people`;
  const budgetText = (b) => !b ? "no budget yet" : b.source === "said" ? `up to ${money(b.ceiling)}, as you said` : b.source === "open" ? `up to ${money(b.ceiling)} since you left it open` : `your usual ${money(b.normal[0])}–${money(b.normal[1])}`;
  const planBudget = (p) => budgetStatus(p.total, p.frame && p.frame.budget);
  function slotFor(cat, frame) {
    if (frame.anchor) { const e = event(frame.anchor.eventId); const o = PREFER_DUR[cat] || 120; return frame.anchor.rel === "before" ? toHH(toMin(e.time) - o - 30) : toHH(toMin(e.time) + 150); }
    return (frame.daytime ? SLOT_DAY : SLOT)[cat][0];
  }
  const PREFER_DUR = { Dining: 120, Wellness: 60, Nightlife: 90, Culture: 120, Workshops: 120, "Sea & Outdoors": 120, Stays: 0 };
  function assumptionLine(frame) {
    const a = [];
    if (frame.party.source !== "said") a.push(partyText(frame.guests));
    if (frame.when.source !== "said") a.push(`${whenText(frame)} around ${slotFor(frame.categories[0] || "Dining", frame)}`);
    else if (frame.scope !== "trip") a.push(`around ${slotFor(frame.categories[0] || "Dining", frame)}`);
    if (frame.budget && frame.budget.source !== "said") a.push(budgetText(frame.budget));
    return a.length ? `I've assumed ${a.join(", ")}; tell me if that's off.` : "";
  }
  function traceFor(frame, cat, ranked, picked) {
    const p = state.profile; const over = ranked.filter((r) => r.overCeiling).length; const b = frame.budget || openBudget(frame.nights, frame.guests);
    return [
      `From ${p.area}; budget ${budgetText(b)}, cap ${money(b.ceiling)}`,
      `${cat} within 4 km, approved vendors only: ${ranked.length} live offers${over ? `, ${over} over the ceiling` : ""}`,
      `Availability ${fdate(day(frame.offset), "short")} for ${partyText(frame.guests)}: ${ranked.length} open`,
      `Ranked for ${frame.purpose}${frame.must.length ? `, must have ${frame.must.join(", ")}` : ""}${frame.avoid.length ? `, avoiding ${frame.avoid.join(" and ")}` : ""}: ${picked} that differ`,
    ];
  }

  /* ---- plans ---- */
  const plan = byId(state.plans);
  function titleFor(frame, cats) {
    if (frame.scope === "trip") return `${frame.nights === 1 ? "A night" : `${frame.nights} nights`} in ${vendor("v9").area}`;
    const when = frame.offset === 0 ? "Tonight" : frame.offset === 1 ? "Tomorrow" : fdate(day(frame.offset), "short").split(" ")[0] + (frame.daytime ? " daytime" : " evening");
    const who = frame.guests === 1 ? "solo" : frame.guests === 2 ? "for two" : `for ${frame.guests}`;
    return `${when} ${who}`;
  }
  function itemFrom(r, frame, date, time, extra) {
    return Object.assign({ offerId: r.offer.id, vendorId: r.vendor.id, date, time, guests: frame.guests, price: r.price, label: r.label, why: r.why }, extra || {});
  }
  function newPlan(frame, title, items, extra) {
    const p = Object.assign({ id: uid("pl"), title, items, status: "draft", createdAt: nowIso(), request: frame.text, frame, scope: frame.scope, preference: frame.travel || "any", guests: frame.guests, date: day(frame.offset), infos: [], assumptions: assumptionLine(frame) }, extra || {});
    p.total = items.reduce((s, i) => s + i.price, 0);
    return p;
  }
  /* A bundle: two or three stops from different categories, ordered by time, the best fit in each. */
  function buildPlan(frame) {
    if (frame.scope === "trip") return buildTrip(frame);
    let cats = frame.categories.filter((c) => c !== "Stays").slice(0, 3);
    const fill = frame.daytime ? ["Sea & Outdoors", "Dining", "Culture"] : ["Wellness", "Dining", "Nightlife"];
    fill.forEach((c) => { if (cats.length < (frame.scope === "single" ? 1 : 3) && !cats.includes(c) && !frame.exclude.includes(c)) cats.push(c); });
    if (frame.purpose === "romantic" && cats.includes("Nightlife") && !frame.categories.includes("Nightlife")) cats = cats.map((c) => c === "Nightlife" ? "Sea & Outdoors" : c).filter((c, i, a) => a.indexOf(c) === i);
    const slots = frame.daytime ? SLOT_DAY : SLOT; const order = Object.keys(slots);
    cats.sort((a, b) => order.indexOf(a) - order.indexOf(b));
    const share = 1 / Math.max(1, cats.length);
    const used = [];
    const items = cats.map((c) => { const r = shortlist(c, frame, share, used)[0]; if (!r) return null; used.push(r.offer.id); return itemFrom(r, frame, day(frame.offset), frame.anchor ? slotFor(c, frame) : slots[c][0]); }).filter(Boolean);
    if (frame.anchor) {
      const e = event(frame.anchor.eventId); const ev = toMin(e.time);
      items.forEach((it, i) => { it.time = frame.anchor.rel === "before" ? toHH(ev - 30 - (items.length - i) * 120) : toHH(ev + 150 + i * 120); });
    }
    items.sort((a, b) => a.time.localeCompare(b.time));
    const p = newPlan(frame, titleFor(frame, cats), items);
    if (frame.anchor) { const e = event(frame.anchor.eventId); p.infos.push({ date: e.date, time: e.time, title: e.title, note: "Already in your wallet", href: `ticket.html?id=${frame.anchor.ticketId}`, kind: "booked" }); }
    return p;
  }
  /* A trip: a stay plus a day-by-day route, a few things that are information only, and a budget
     sheet with an envelope, what is planned against it, and what is left. */
  function buildTrip(frame) {
    const nights = frame.nights || 2; const days = nights + 1;
    const dayFrame = Object.assign({}, frame, { daytime: true });
    const share = 1 / (nights + 4);
    const used = []; const items = []; const infos = [];
    const take = (cat, fr, d, time, extra) => { const r = shortlist(cat, fr, share, used)[0]; if (!r) return null; used.push(r.offer.id); const it = itemFrom(r, fr, day(frame.offset + d), time, extra); items.push(it); return it; };
    const stayR = rank("Stays", frame, 0.55 * days)[0];
    if (stayR) { used.push(stayR.offer.id); items.push(itemFrom(Object.assign(stayR, { label: "Stay", why: `${stayR.vendor.name}: ${TRAIT_WORDS[stayR.traits[0]] || "central"}, central to every day.` }), frame, day(frame.offset), "15:00", { nights, price: stayR.price * nights })); }
    take("Sea & Outdoors", frame, 0, "17:15");
    take("Dining", frame, 0, "20:00");
    if (!frame.exclude.includes("Nightlife") && frame.purpose === "celebration") take("Nightlife", frame, 0, "22:45");
    if (nights >= 1) {
      take("Culture", dayFrame, 1, "10:30");
      take("Dining", dayFrame, 1, "13:00");
      infos.push({ date: day(frame.offset + 1), time: "15:30", title: "Jaffa flea market stroll", note: "Info only · Not bookable here · free", kind: "info" });
      take("Wellness", frame, 1, "17:30");
      take("Dining", frame, 1, "20:00");
    }
    if (nights >= 2) {
      take("Sea & Outdoors", dayFrame, 2, "07:30");
      take("Workshops", dayFrame, 2, "10:00");
      infos.push({ date: day(frame.offset + 2), time: "13:00", title: "Lunch on the way back", note: "Info only · Left open on purpose", kind: "info" });
    }
    if (nights >= 3) { take("Culture", dayFrame, 3, "10:00"); take("Dining", dayFrame, 3, "13:00"); }
    infos.push({ date: day(frame.offset + nights), time: "11:00", title: "Check-out", note: `${stayR ? stayR.vendor.name : "Hotel"} · 11:00`, kind: "info" });
    infos.push({ date: day(frame.offset), time: "18:45", title: "Sunset at Jaffa Port", note: "Info only · Not bookable here · free", kind: "info" });
    items.sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time));
    infos.sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time));
    const p = newPlan(frame, titleFor(frame), items, { nights, days, infos });
    p.budget = budgetSheet(p);
    p.upgrade = upgradeFor(p);
    return p;
  }
  const TRIP_SPLIT = [["Stay", 0.5, (c) => c === "Stays"], ["Food", 0.22, (c) => c === "Dining"], ["Activities", 0.13, (c) => ["Sea & Outdoors", "Culture", "Workshops", "Nightlife"].includes(c)], ["Wellness", 0.08, (c) => c === "Wellness"], ["Buffer", 0.07, () => false]];
  function budgetSheet(p) {
    const f = p.frame; const b = f.budget || openBudget(f.nights, f.guests); const envelope = b.source === "profile" ? b.ceiling * (p.days || 1) : b.ceiling;
    const rows = TRIP_SPLIT.map(([name, pct, match]) => ({ name, envelope: Math.round(envelope * pct / 50) * 50, planned: p.items.filter((i) => match(vendor(i.vendorId).category)).reduce((s, i) => s + i.price, 0), note: "" }));
    const buffer = rows.find((r) => r.name === "Buffer"); buffer.planned = buffer.envelope; buffer.note = "kept";
    rows.forEach((r) => { if (r.name === "Stay") r.note = "live quote, re-checked at hold"; else if (r.planned > r.envelope && r.name !== "Buffer") { const over = r.planned - r.envelope; const donor = rows.find((d) => d !== r && d.name !== "Buffer" && d.envelope - d.planned >= over); r.note = donor ? `${money(over)} moved from ${donor.name.toLowerCase()}` : `${money(over)} over`; } });
    const planned = rows.reduce((s, r) => s + r.planned, 0);
    return { envelope, rows, planned, unspent: envelope - planned, source: b.source };
  }
  /* One upgrade the unspent money could pay for, offered once and never pushed. */
  function upgradeFor(p) {
    const b = p.budget; if (!b || b.unspent <= 0) return null;
    const idx = p.items.findIndex((i) => i.offerId === "o3"); const alt = offer("o4");
    if (idx >= 0 && alt && alt.status === "active") { const extra = itemPrice(alt, 2) - p.items[idx].price; if (extra > 0 && extra <= b.unspent + (b.rows.find((r) => r.name === "Buffer") || { planned: 0 }).planned) return { offerId: "o4", idx, extra, text: `${alt.title} instead of the massages costs ${money(extra)} more. ${extra <= b.unspent ? `The ${money(b.unspent)} unspent covers it` : `Using the ${money(b.unspent)} unspent plus ${money(extra - b.unspent)} of the buffer keeps you at your ceiling`}. Want to switch?` }; }
    return null;
  }
  function planRecalc(p) {
    p.total = p.items.reduce((s, i) => s + i.price, 0);
    if (p.scope === "trip") { p.budget = budgetSheet(p); if (p.upgrade && !p.items[p.upgrade.idx]) p.upgrade = null; }
    save();
  }
  function planDays(p) {
    const dates = [...new Set([...p.items.map((i) => i.date), ...(p.infos || []).map((i) => i.date)])].sort();
    return dates.map((date, n) => ({ date, n, stops: [...p.items.map((it, idx) => Object.assign({ idx }, it)), ...(p.infos || []).filter((i) => i.date === date)].filter((s) => s.date === date).sort((a, b) => a.time.localeCompare(b.time)) }));
  }
  function alternativesFor(it, guests) {
    const cur = offer(it.offerId); const cat = vendor(cur.vendorId).category;
    return state.offers.filter((o) => o.id !== it.offerId && o.status === "active" && vendor(o.vendorId).category === cat && vendor(o.vendorId).status === "active");
  }
  function cheaperAlternative(it) {
    const cur = offer(it.offerId); const cat = vendor(cur.vendorId).category;
    return state.offers.filter((o) => o.status === "active" && vendor(o.vendorId).category === cat && itemPrice(o, it.guests) < it.price && vendor(o.vendorId).status === "active").sort((a, b) => itemPrice(b, it.guests) - itemPrice(a, it.guests))[0];
  }
  function swapPlanItem(planId, idx, offerId) { const p = plan(planId); const o = offer(offerId); const it = p.items[idx]; Object.assign(it, { offerId, vendorId: o.vendorId, price: itemPrice(o, it.guests) * (it.nights || 1), label: "Your pick", why: "" }); planRecalc(p); }
  function removePlanItem(planId, idx) { const p = plan(planId); p.items.splice(idx, 1); planRecalc(p); }
  function addPlanItem(planId, offerId, time) { const p = plan(planId); const o = offer(offerId); p.items.push({ offerId, vendorId: o.vendorId, date: p.date, time: time || SLOT[vendor(o.vendorId).category][0], guests: p.guests, price: itemPrice(o, p.guests), label: "Your pick" }); p.items.sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time)); planRecalc(p); }
  function setPlanGuests(planId, guests) { const p = plan(planId); p.guests = guests; p.items.forEach((it) => { it.guests = guests; it.price = itemPrice(offer(it.offerId), guests) * (it.nights || 1); }); planRecalc(p); }
  function applyUpgrade(planId) { const p = plan(planId); const u = p.upgrade; if (!u) return null; const it = p.items[u.idx]; const from = offer(it.offerId); const o = offer(u.offerId); Object.assign(it, { offerId: o.id, vendorId: o.vendorId, price: itemPrice(o, 2), label: "Upgrade", why: `${o.title}: the full treatment, side by side.` }); p.upgrade = null; planRecalc(p); return { from, to: o }; }
  /* The one-step reservation from an option card: a single-item plan, straight to payment. */
  function reservePlan(opt) {
    const o = offer(opt.offerId); const v = vendor(o.vendorId); const c = state.chat;
    const frame = c.frame || parseRequest(o.title);
    const items = [{ offerId: o.id, vendorId: v.id, date: opt.date, time: opt.time, guests: opt.guests, price: opt.price, label: opt.label, why: opt.why || "" }];
    const p = newPlan(Object.assign({}, frame, { scope: "single", guests: opt.guests }), `${o.title}, ${v.name}`, items);
    state.plans.unshift(p); c.planId = p.id; c.stage = 2;
    c.messages.push({ from: "me", text: `Reserve ${v.name}`, at: nowIso() });
    c.messages.push({ from: "ai", text: `Holding ${o.title} at ${v.name} for ${opt.time} on ${fdate(opt.date)} while you pay. ${bookingShape(o).hold}, ${bookingShape(o).pay.toLowerCase()}.`, planId: p.id, at: nowIso() });
    save(); return p;
  }

  /* ---- the conversation ---- */
  const reply = (text, extra) => Object.assign({ id: uid("m"), from: "ai", text, at: nowIso() }, extra || {});
  function conciergeSend(text) {
    const c = state.chat;
    c.messages.push({ from: "me", text, at: nowIso() });
    /* The bubble keeps what the member typed; the parser only knows English, so Hebrew is
       mapped to the English keywords first (assets/i18n.js). */
    const parsed = window.BLI18N ? window.BLI18N.toEnglish(text) : text;
    const replies = respond(parsed.trim(), c);
    save();
    return replies;
  }
  function conciergeReply(r) { state.chat.messages.push(r); save(); }
  function resetChat() { state.chat = { stage: 0, messages: [greetingMessage()], draft: null, planId: null, frame: null, follow: null, noFollowUp: false, prefs: [], pendingMemory: null }; save(); }
  function greetingMessage() { return reply(`Hi ${state.profile.name.split(" ")[0]}. Tell me what you want to do, when, and how many of you. If I need anything else, like a budget, I'll ask.`); }
  function respond(t, c) {
    c.prefs = c.prefs || [];
    if (/^(start over|new plan|something else|clean slate|reset|start again)/i.test(t)) { resetChat(); return [reply("Clean slate. What do you want to do?")]; }
    if (c.pendingMemory) { const m = c.pendingMemory; c.pendingMemory = null;
      if (/remember|save|yes|keep/i.test(t)) { rememberPreference(m); return [reply("Saved to your profile, where you can see it and delete it. I'll weigh it next time too."), ...applyPrefs(c, m)]; }
      c.prefs.push(m); return [reply("Just for now, then. Nothing saved."), ...applyPrefs(c, m)]; }
    if (/^remember (this|that|my|the) budget/i.test(t)) {
      const f = c.frame; if (!f || !f.budget) return [reply("Tell me a budget first and I'll keep it.")];
      rememberPreference({ kind: "budget", text: `usual budget up to ${money(f.budget.ceiling)}`, budget: f.budget });
      return [reply(`Kept. I'll take up to ${money(f.budget.ceiling)} as your usual budget and only ask again for something a different size, like a trip. It's on your profile if you want to drop it.`)];
    }
    const mem = memoryFrom(t);
    if (mem) { c.pendingMemory = mem; return [reply(`Noted: ${mem.text}. Want me to remember that for next time, or only use it now?`, { chips: ["Remember this", "Just for now"] })]; }
    if (c.stage === 1 && c.draft) {
      const ans = parseRequest(t); const d = c.draft;
      if (ans.when.source === "said") { d.offset = ans.offset; d.when = ans.when; }
      if (ans.nights) d.nights = ans.nights;
      if (ans.party.source === "said") { d.guests = ans.guests; d.party = ans.party; }
      if (ans.wants.length && !d.wants.length) { d.wants = ans.wants; d.categories = ans.wants.slice(); d.scope = ans.scope; }
      if (ans.budget && ans.budget.source === "said") d.budget = ans.budget;
      else if (ans.budget && ans.budget.source === "open") d.budget = openBudget(d.nights, d.guests);
      else if (!d.budget) { const bare = t.replace(/,/g, "").match(/\b(\d{3,5})\b/); if (bare) d.budget = saidBudget(Number(bare[1])); }
      withPrefs(d, c);
      const q = askMissing(d, c); if (q) return q;
      c.draft = null; c.stage = 0;
      return answer(d, c);
    }
    if (c.follow && /^(yes|add|sure|go on|please|ok|okay|why not)/i.test(t)) { const f = c.frame; const cat = c.follow; c.follow = null; const fr = Object.assign({}, f, { scope: "bundle", categories: [...f.categories, cat], wants: [...f.categories, cat] }); return answer(fr, c); }
    if (/^(no|no thanks|not now|nope|no thank you|skip|keep it|i'm good|im good)\b/i.test(t)) { c.noFollowUp = true; c.follow = null; if (c.planId && plan(c.planId) && plan(c.planId).upgrade) { plan(c.planId).upgrade = null; save(); } return [reply("Noted. I won't bring it up again.")]; }
    if (c.stage === 2 && c.planId && plan(c.planId)) { const r = editPlan(t, c); if (r) return r; }
    const frame = withPrefs(parseRequest(t), c);
    if (frame.missing.includes("what")) return [reply("Say what you want to do, when, and how many of you. One place, a short evening or a few days away, whichever fits. I'll ask about money only if I need to.", { chips: ["A quiet candlelit dinner for two on Saturday", "A relaxed evening for two tomorrow, then dinner", "A weekend away for two, 2 nights"] })];
    const q = askMissing(frame, c); if (q) return q;
    return answer(frame, c);
  }
  /* One question at a time, sized to the ask, and only for what the plan cannot do without. */
  const CAT_WORD = { Dining: "A table", Wellness: "A treatment", Nightlife: "A night out", "Sea & Outdoors": "Time on the water", Culture: "Something cultural", Workshops: "A workshop", Stays: "A stay" };
  function askMissing(frame, c) {
    const q = frame.missing[0]; if (!q) return null;
    c.draft = frame; c.stage = 1;
    const nightsText = frame.nights === 1 ? "One night" : `${frame.nights} nights`;
    if (q === "when") return [reply(`${nightsText} for ${partyText(frame.guests)}. Which dates?`, { chips: ["This weekend", "Next weekend", "Tomorrow"] })];
    if (frame.scope === "trip") return [reply(`${nightsText} from ${fdate(day(frame.offset), "short")} for ${partyText(frame.guests)}. Roughly what's the budget for the whole trip, stay included? A rough number is fine, or leave it open.`, { chips: ["Around ₪4,000", "Around ₪6,000", "Up to ₪9,000", "Surprise me"] })];
    const lead = frame.scope === "single" ? `${CAT_WORD[frame.categories[0]] || "Something"} ${whenLong(frame)} for ${partyText(frame.guests)}.` : `${cap(whenLong(frame).replace(/^on /, ""))} for ${partyText(frame.guests)}.`;
    const ask = frame.scope === "single" ? `Roughly what would you like to spend${frame.guests === 2 ? " for the two of you" : ""}? A rough number is fine.` : "Roughly what's the budget for the evening, all in?";
    return [reply(`${lead} ${ask}`, { chips: ["Around ₪500", "Around ₪900", "Up to ₪1,500", "Surprise me"] })];
  }
  /* Things said earlier in this chat, kept only for now, still shape the next ask. */
  function withPrefs(frame, c) {
    const prefs = c.prefs || [];
    frame.avoid = [...new Set([...frame.avoid, ...prefs.flatMap((m) => m.avoid ? [m.avoid, "crowded"] : [])])];
    prefs.forEach((m) => { if (m.trait && !frame.must.includes(m.trait)) frame.must.push(m.trait); });
    const pb = prefs.find((m) => m.budget);
    if (pb && (!frame.budget || frame.budget.source === "profile")) frame.budget = Object.assign({}, pb.budget, { source: "said" });
    frame.missing = missingFor(frame);
    return frame;
  }
  function memoryFrom(t) {
    const s = t.toLowerCase();
    if (/^(remember|from now on|for next time|in future|i('m| am) (vegetarian|vegan)|i don'?t like|i hate|i prefer|we don'?t like|we prefer|my budget is|our budget is)/.test(s)) {
      const bm = s.replace(/,/g, "").match(/(\d{3,5})/);
      if (/budget|spend/.test(s) && bm) { const b = saidBudget(Number(bm[1])); return { kind: "budget", text: `usual budget up to ${money(b.ceiling)}`, budget: b }; }
      const avoid = /loud|noisy|crowd|music/.test(s) && /don'?t|hate|no |avoid|not/.test(s) ? "loud" : null;
      const trait = /vegetarian|vegan|veg\b/.test(s) ? "veg" : /quiet|calm/.test(s) ? "quiet" : /romantic/.test(s) ? "romantic" : /sea|water|beach/.test(s) ? "sea" : null;
      if (!avoid && !trait) return null;
      return { text: avoid ? "no loud or crowded places" : { veg: "vegetarian-friendly first", quiet: "quiet places first", romantic: "made for a date", sea: "near the water when possible" }[trait], avoid, trait };
    }
    return null;
  }
  function applyPrefs(c, m) {
    if (m.budget) { const d = c.draft; if (c.stage === 1 && d) { d.budget = Object.assign({}, m.budget); withPrefs(d, c); const q = askMissing(d, c); if (q) return q; c.draft = null; c.stage = 0; return answer(d, c); } return []; }
    const p = c.planId && plan(c.planId); if (!p || p.status !== "draft") return [];
    const fr = Object.assign({}, p.frame || c.frame || parseRequest(p.request || ""), { avoid: [...((p.frame || {}).avoid || []), ...(m.avoid ? [m.avoid, "crowded"] : [])] });
    if (m.trait && !fr.must.includes(m.trait)) fr.must = [...fr.must, m.trait];
    return [diffReply(p, fr, "Reworked the plan around that.")];
  }
  /* Re-rank every stop under a changed frame and show what moved, as a diff. */
  function diffReply(p, frame, lead) {
    const before = p.total; const lines = [];
    const used = p.items.map((i) => i.offerId);
    p.items.forEach((it, idx) => {
      const o = offer(it.offerId); const cat = vendor(o.vendorId).category; const tr = TRAITS[o.id] || [];
      const bad = frame.avoid.some((a) => tr.includes(a)) || frame.must.some((m) => !tr.includes(m) && cat === "Dining");
      if (!bad) { lines.push({ op: "=", title: `${o.title}, ${fdate(it.date, "short").split(" ")[0]} ${it.time}`, why: "unchanged" }); return; }
      const r = shortlist(cat, frame, 1 / Math.max(1, p.items.length), used.filter((id) => id !== it.offerId))[0];
      if (!r || r.offer.id === it.offerId) { lines.push({ op: "=", title: `${o.title}, ${it.time}`, why: "nothing registered fits better" }); return; }
      lines.push({ op: "-", title: `${o.title} (${it.time})`, why: frame.avoid.some((a) => tr.includes(a)) ? "louder than you want" : `missing ${frame.must.find((m) => !tr.includes(m))}` });
      lines.push({ op: "+", title: `${r.offer.title}, ${r.vendor.name}`, why: r.line.split(" · ").slice(1, 4).join(" · ") });
      used[idx] = r.offer.id;
      Object.assign(it, { offerId: r.offer.id, vendorId: r.vendor.id, price: r.price * (it.nights || 1), label: r.label, why: r.why });
    });
    p.frame = frame; planRecalc(p);
    const delta = p.total - before;
    lines.push({ op: "=", title: `Total ${money(p.total)}${delta ? ` (${delta < 0 ? "−" : "+"}${money(Math.abs(delta))})` : ""}`, why: planBudget(p).label.toLowerCase() });
    return reply(lead, { diff: lines, planId: p.id, chips: ["Review plan", "Start over"] });
  }
  /* Offered once, after a budget the member typed: keep it, or it is forgotten with the chat. */
  const keepBudgetChip = (frame) => frame.budget && frame.budget.source === "said" && frame.scope !== "trip" && !state.profile.budget ? ["Remember this budget"] : [];
  function answer(frame, c) {
    c.frame = frame; c.follow = null;
    if (frame.scope === "single") return singleReply(frame, c);
    return bundleReply(frame, c);
  }
  function singleReply(frame, c) {
    const cat = frame.categories[0];
    const ranked = rank(cat, frame, 1); const opts = shortlist(cat, frame, 1);
    const out = [];
    if (!opts.length) { c.stage = 0; return [reply(`Nothing registered for ${cat.toLowerCase()} is open ${whenText(frame)}. Want me to look at another kind of evening, or another day?`, { chips: ["Start over"] })]; }
    const best = opts[0]; const time = slotFor(cat, frame);
    const options = opts.map((r) => ({ offerId: r.offer.id, label: r.label, price: r.price, line: r.line, why: r.why, time, date: day(frame.offset), guests: frame.guests, over: r.overCeiling }));
    let lead;
    if (best.overCeiling) lead = `Nothing registered for ${cat.toLowerCase()} fits under your ${money(best.ceil)} ceiling ${whenText(frame)}. The closest is ${best.vendor.name} at ${money(best.price)}, ${money(best.price - best.ceil)} over, and I won't book it unless you say so.`;
    else lead = `For ${whenText(frame)}, ${best.vendor.name} is the one. ${best.why} ${frame.anchor ? `It's ${best.km < 2 ? "a short walk" : "a short taxi"} from ${event(frame.anchor.eventId).venue}, and ${time} leaves time ${frame.anchor.rel === "before" ? "before the doors" : "after the last set"}.` : `They have ${frame.guests === 1 ? "a seat" : `a table for ${frame.guests}`} at ${time}.`}`;
    out.push(reply(lead, { options, trace: traceFor(frame, cat, ranked, opts.length) }));
    const assume = assumptionLine(frame);
    const follow = FOLLOW[cat];
    let chips = [...keepBudgetChip(frame), "Start over"];
    let text = assume;
    if (follow && !c.noFollowUp && !frame.exclude.includes(follow[0])) { c.follow = follow[0]; text = `${assume} ${assume ? "I can also" : "I can"} add ${follow[1]} if that helps.`.trim(); chips = ["Yes, add it", "No thanks", ...keepBudgetChip(frame), "Start over"]; }
    out.push(reply(text || "Pick one above, or tell me what's off.", { chips }));
    c.stage = 2; c.planId = null;
    return out;
  }
  function bundleReply(frame, c) {
    const p = buildPlan(frame);
    if (!p.items.length) { c.stage = 0; return [reply("Nothing registered is open for that. Try another day, or tell me one thing you'd like and I'll build around it.", { chips: ["Start over"] })]; }
    state.plans.unshift(p); c.planId = p.id; c.stage = 2;
    const bs = planBudget(p);
    const out = [];
    if (p.scope === "trip") {
      const stay = p.items.find((i) => i.nights);
      const b = p.budget;
      const against = b.source === "said" ? `Against your ${money(b.envelope)}` : b.source === "open" ? `You left the budget open, so I capped it at ${money(b.envelope)}; against that` : `Against ${money(b.envelope)} for ${p.days} days from your usual ceiling`;
      const lead = `${p.days} days, ${p.items.length} bookable stops${stay ? `, staying at ${vendor(stay.vendorId).name}` : ""}. ${against}, it comes to ${money(b.planned)}${b.unspent >= 0 ? `, ${money(b.unspent)} unspent` : `, ${money(-b.unspent)} over`}. Things that aren't bookable here are marked as information only.`;
      out.push(reply(lead, { planId: p.id, trace: traceFor(frame, "Stays, dining, activities", rank("Dining", frame, 1), p.items.length) }));
      if (p.upgrade) out.push(reply(`Upgrade offer: ${p.upgrade.text}`, { chips: ["Switch", "Keep it", "Review plan"] }));
      else out.push(reply(`${assumptionLine(frame)} Open the plan for the day-by-day and the budget sheet.`.trim(), { chips: ["Review plan", "Make it quieter", "Make it cheaper", "Start over"] }));
      return out;
    }
    const names = p.items.map((it) => `${offer(it.offerId).title} at ${vendor(it.vendorId).name}`);
    const first = p.items[0];
    const lead = `${frame.anchor ? `${frame.anchor.rel === "before" ? "Before" : "After"} ${event(frame.anchor.eventId).title}, ` : `For ${whenText(frame)}, `}${names.length === 1 ? names[0] : names.slice(0, -1).join(", then ") + ", then " + names[names.length - 1]}. ${first.why} ${money(p.total)} all in, ${bs.label.toLowerCase()}.`;
    out.push(reply(lead, { planId: p.id, trace: traceFor(frame, p.items.map((i) => vendor(i.vendorId).category).join(", "), p.items.map((i) => offer(i.offerId)).flatMap((o) => rank(vendor(o.vendorId).category, frame, 1)), p.items.length) }));
    out.push(reply(`${assumptionLine(frame)} Open the plan to swap or drop a stop, or tell me what's off. One swipe pays every vendor at once.`.trim(), { chips: ["Review plan", "Make it quieter", "Make it cheaper", ...keepBudgetChip(frame), "Start over"] }));
    return out;
  }
  /* Edits to a plan that already exists. Each returns a diff, or null when the text is a new ask. */
  function editPlan(t, c) {
    const p = plan(c.planId); const s = t.toLowerCase(); const fr = p.frame || c.frame || parseRequest(p.request || "");
    if (p.status !== "draft") { if (/cheaper|quieter|swap|change|move|add|drop|remove|earlier|later/.test(s)) return [reply("That plan is already booked. Open the booking to change or cancel a stop, or tell me what to plan next.", { chips: ["Start over"] })]; return null; }
    if (/^(switch|yes,? switch|upgrade|do it|take the upgrade)/.test(s) && p.upgrade) { const before = p.total; const r = applyUpgrade(p.id); return [reply("Switched.", { diff: [{ op: "-", title: r.from.title, why: "replaced" }, { op: "+", title: `${r.to.title}, ${vendor(r.to.vendorId).name}`, why: "side by side, hammam first" }, { op: "=", title: `Total ${money(p.total)} (+${money(p.total - before)})`, why: p.budget ? `${money(Math.max(0, p.budget.unspent))} unspent` : budgetStatus(p.total).label.toLowerCase() }], planId: p.id, chips: ["Review plan", "Start over"] })]; }
    if (/quiet|not (too )?loud|no music|calm|crowd|low[- ]?key|somewhere still/.test(s)) { const f = Object.assign({}, fr, { avoid: [...new Set([...fr.avoid, "loud", "crowded"])] }); const r = diffReply(p, f, r0(f)); return [r]; }
    if (/cheaper|budget|less|too much|expensive|save/.test(s)) {
      if (p.items.length < 1) return null;
      const priciest = p.items.reduce((a, b) => (a.price > b.price ? a : b)); const alt = cheaperAlternative(priciest);
      if (!alt) return [reply("Every stop is already the lightest option in its category. Drop one instead?", { chips: ["Review plan", "Start over"] })];
      const before = p.total; const from = offer(priciest.offerId);
      Object.assign(priciest, { offerId: alt.id, vendorId: alt.vendorId, price: itemPrice(alt, priciest.guests) * (priciest.nights || 1), label: "Better value", why: "" }); planRecalc(p);
      return [reply("Swapped the priciest stop.", { diff: [{ op: "-", title: `${from.title} (${priciest.time})`, why: `${money(before - p.total)} more` }, { op: "+", title: `${alt.title}, ${vendor(alt.vendorId).name}`, why: `${(KM[vendor(alt.vendorId).area] || 2).toFixed(1)} km · ${bookingShape(alt).pay.toLowerCase()}` }, { op: "=", title: `Total ${money(p.total)} (−${money(before - p.total)})`, why: budgetStatus(p.total).label.toLowerCase() }], planId: p.id, chips: ["Review plan", "Make it quieter", "Start over"] })];
    }
    const gm = s.match(/\b(?:for|make it|we are|we're|party of)\s+(\d{1,2}|one|two|three|four|five|six|seven|eight|ten)\b(?!\s*(?:days?|nights?|hours?))/) || s.match(/\b(\d{1,2}|two|three|four|five|six|eight|ten)\s+(?:of us|people|guests)\b/);
    if (gm) { const n = Math.max(1, Math.min(12, NUMS[gm[1]] || Number(gm[1]))); const before = p.total; setPlanGuests(p.id, n); return [reply(`Now for ${partyText(n)}.`, { diff: [{ op: "=", title: `${p.items.length} stops unchanged`, why: "per-person stops repriced" }, { op: "=", title: `Total ${money(p.total)} (${p.total >= before ? "+" : "−"}${money(Math.abs(p.total - before))})`, why: budgetStatus(p.total).label.toLowerCase() }], planId: p.id, chips: ["Review plan", "Start over"] })]; }
    if (/\b(earlier|later)\b/.test(s)) { const d = /earlier/.test(s) ? -60 : 60; p.items.forEach((it) => { if (!it.nights) it.time = toHH(toMin(it.time) + d); }); planRecalc(p); return [reply(`Moved everything an hour ${d < 0 ? "earlier" : "later"}.`, { diff: p.items.map((it) => ({ op: "=", title: offer(it.offerId).title, why: `now ${it.time}` })), planId: p.id, chips: ["Review plan", "Start over"] })]; }
    const dm = s.match(/\b(drop|remove|skip|without|lose|cancel)\b/);
    if (dm) { const ask = parseRequest(s); const cat = ask.wants[0] || ask.exclude[0]; const idx = p.items.findIndex((it) => vendor(it.vendorId).category === cat); if (idx >= 0) { const o = offer(p.items[idx].offerId); const before = p.total; removePlanItem(p.id, idx); return [reply(`Dropped it.`, { diff: [{ op: "-", title: o.title, why: "at your request" }, { op: "=", title: `Total ${money(p.total)} (−${money(before - p.total)})`, why: budgetStatus(p.total).label.toLowerCase() }], planId: p.id, chips: ["Review plan", "Start over"] })]; } }
    if (/^(add|and|also|plus|include|throw in)\b/.test(s) || (/\badd\b/.test(s) && !/address/.test(s))) { const ask = parseRequest(s); const cat = ask.wants.find((w) => !p.items.some((it) => vendor(it.vendorId).category === w)) || ask.wants[0]; if (cat) { const r = shortlist(cat, fr, 1 / (p.items.length + 1), p.items.map((i) => i.offerId))[0]; if (r) { const before = p.total; p.items.push(itemFrom(r, Object.assign({}, fr, { guests: p.guests }), p.date, slotFor(cat, fr))); p.items.sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time)); planRecalc(p); return [reply(`Added ${r.offer.title}.`, { diff: [{ op: "+", title: `${r.offer.title}, ${r.vendor.name}`, why: r.line.split(" · ").slice(1, 4).join(" · ") }, { op: "=", title: `Total ${money(p.total)} (+${money(p.total - before)})`, why: budgetStatus(p.total).label.toLowerCase() }], planId: p.id, chips: ["Review plan", "Start over"] })]; } } }
    if (/walk|taxi|cab/.test(s)) { p.preference = /walk/.test(s) ? "walkable" : "taxi"; save(); return [reply(p.preference === "walkable" ? "Kept every stop within a short walk of the last." : "Short taxis between stops, under ten minutes each.", { planId: p.id, chips: ["Review plan", "Start over"] })]; }
    const ask = parseRequest(s);
    if (ask.wants.length || ask.when.source === "said" || ask.nights) return null;
    return [reply("Noted. Open the plan to change it by hand, say what's off, or start over.", { chips: ["Review plan", "Start over"] })];
  }
  const r0 = (f) => f.avoid.length ? "Quieter it is. Here's what moved." : "Here's what moved.";

  /* ---- the booking saga: hold and re-quote, then charge, then confirm each vendor ---- */
  function holdPlan(planId, mode) {
    const p = plan(planId); const until = Date.now() + 10 * 60 * 1000; const changes = []; let failed = null;
    const priciest = p.items.reduce((a, b, i, arr) => (arr[a].price >= b.price ? a : i), 0);
    p.items.forEach((it, i) => {
      it.hold = { until, quoted: it.price, status: "held", shape: bookingShape(offer(it.offerId)).hold };
      if (mode === "requote" && i === priciest) { const next = Math.round(it.price * 1.08 / 10) * 10; it.hold.quoted = next; changes.push({ idx: i, from: it.price, to: next }); }
      if (mode === "nohold" && i === p.items.length - 1) { it.hold.status = "failed"; failed = i; }
    });
    p.holdUntil = until; p.saga = { changes, failed, at: nowIso() }; save();
    return { ok: failed === null && !changes.length, changes, failed, until };
  }
  function acceptRequote(planId) { const p = plan(planId); p.items.forEach((it) => { if (it.hold && it.hold.quoted !== it.price) { it.requotedFrom = it.price; it.price = it.hold.quoted; } }); planRecalc(p); return p; }
  function releasePlanHolds(planId) { const p = plan(planId); if (!p) return; p.items.forEach((it) => { delete it.hold; }); p.holdUntil = null; p.saga = null; save(); }
  /* Memory is explicit: nothing lands on the profile unless the member said to keep it, and the
     profile screen lists every entry with a delete. A kept budget becomes the one the concierge
     stops asking for; deleting it brings the question back. */
  function rememberPreference(m) {
    state.profile.remembered = (state.profile.remembered || []).filter((r) => !(m.kind === "budget" && r.kind === "budget"));
    state.profile.remembered.push(Object.assign({ id: uid("r"), at: nowIso() }, m));
    if (m.budget) state.profile.budget = { normal: m.budget.normal.slice(), flex: m.budget.flex, ceiling: m.budget.ceiling };
    save();
  }
  function forgetPreference(id) {
    const r = (state.profile.remembered || []).find((x) => x.id === id);
    state.profile.remembered = (state.profile.remembered || []).filter((x) => x.id !== id);
    if (r && r.kind === "budget") state.profile.budget = null;
    save();
  }

  /* ---------- payments and bookings ---------- */
  function addTx(tx) { state.walletTx.unshift(Object.assign({ id: uid("w"), at: nowIso() }, tx)); }
  function payPlan(planId, method, outcome) {
    const p = plan(planId);
    const pay = { id: uid("p"), bookingId: null, userId: me(), amount: p.total, method, status: "succeeded", at: nowIso(), refundAmount: 0, kind: "booking" };
    if (outcome === "failed") { pay.status = "failed"; pay.failReason = method === "Wallet" ? "Wallet balance too low" : "Card declined by issuer"; state.payments.unshift(pay); save(); return { ok: false, payment: pay }; }
    if (outcome === "pending") pay.status = "pending";
    const b = { id: uid("b"), code: code("BLS"), userId: me(), title: p.title, source: "concierge", createdAt: nowIso(), paymentId: pay.id, status: "pending", planId: p.id,
      items: p.items.map((it) => Object.assign({}, it, { status: "pending", hold: undefined })), total: p.total, holdUntil: p.holdUntil || null, scope: p.scope || "bundle" };
    pay.bookingId = b.id;
    state.payments.unshift(pay); state.bookings.unshift(b);
    p.status = "booked"; p.bookingId = b.id;
    if (method === "Wallet") state.profile.walletBalance -= p.total;
    if (pay.status === "succeeded") { addTx({ type: "payment", amount: -p.total, title: b.title, bookingId: b.id }); state.profile.points += Math.round(p.total / 100); }
    save();
    return { ok: true, booking: b, payment: pay };
  }
  function settlePending(paymentId) {
    const pay = payment(paymentId); if (!pay || pay.status !== "pending") return;
    pay.status = "succeeded"; const b = booking(pay.bookingId);
    addTx({ type: "payment", amount: -pay.amount, title: b ? b.title : "Booking", bookingId: pay.bookingId }); state.profile.points += Math.round(pay.amount / 100);
    save();
  }
  function recomputeBooking(b) {
    const live = b.items.filter((i) => i.status !== "declined" && i.status !== "cancelled");
    if (b.status === "cancelled") return;
    if (live.length === 0) b.status = "refunded";
    else if (live.every((i) => i.status === "redeemed")) b.status = "completed";
    else if (live.some((i) => i.status === "pending")) b.status = b.items.some((i) => i.status === "declined") ? "partial" : "pending";
    else b.status = b.items.some((i) => i.status === "declined") ? "partial" : "confirmed";
  }
  function refundItem(b, it, reason) {
    const pay = payment(b.paymentId);
    it.refunded = it.price;
    if (pay) { pay.refundAmount = (pay.refundAmount || 0) + it.price; pay.status = pay.refundAmount >= pay.amount ? "refunded" : "partially_refunded"; }
    if (b.userId === me()) { addTx({ type: "refund", amount: it.price, title: `Refund, ${offer(it.offerId).title}`, bookingId: b.id }); if (pay && pay.method === "Wallet") state.profile.walletBalance += it.price; }
    state.log.unshift({ at: nowIso(), text: `Refunded ${money(it.price)} on ${b.code}: ${reason}` });
  }
  function vendorDecide(bookingId, offerId, decision, reason) {
    const b = booking(bookingId); const it = b.items.find((i) => i.offerId === offerId && i.status === "pending"); if (!it) return b;
    /* A confirmed stay or pass comes back with its own voucher, as the architecture doc's booking
       shapes describe; a table or a slot is confirmed by the vendor's word alone. */
    if (decision === "confirm") { it.status = "confirmed"; it.confirmedAt = nowIso(); const o = offer(it.offerId); if (o && vendor(o.vendorId).category === "Stays") it.voucher = code("VCH"); else if (o && bookingShape(o).wallet) it.voucher = code("PASS"); }
    else { it.status = "declined"; it.declineReason = reason || "No availability"; it.declinedAt = nowIso(); refundItem(b, it, it.declineReason); }
    recomputeBooking(b); save(); return b;
  }
  /* `force` refunds in full whatever the date: a member who drops the rest of a plan the moment
     one vendor fails is unwinding a saga, not cancelling a booking. */
  function cancelBooking(bookingId, force) {
    const b = booking(bookingId); if (!b) return null;
    const first = b.items.map((i) => i.date).sort()[0];
    const full = !!force || daysUntil(first) >= 1;
    const pay = payment(b.paymentId);
    const live = b.items.filter((i) => i.status === "confirmed" || i.status === "pending");
    const amount = live.reduce((s, i) => s + i.price, 0);
    const refund = full ? amount : 0;
    live.forEach((i) => { i.status = "cancelled"; if (full) i.refunded = i.price; });
    b.status = "cancelled"; b.cancelledAt = nowIso(); b.refund = refund;
    if (pay && refund > 0) { pay.refundAmount = (pay.refundAmount || 0) + refund; pay.status = pay.refundAmount >= pay.amount ? "refunded" : "partially_refunded"; if (pay.method === "Wallet" && b.userId === me()) state.profile.walletBalance += refund; }
    if (refund > 0 && b.userId === me()) addTx({ type: "refund", amount: refund, title: `Refund, ${b.title}`, bookingId: b.id });
    save(); return { booking: b, refund, full };
  }
  function redeemCode(codeStr, vendorId) {
    const c = (codeStr || "").trim().toUpperCase();
    const b = state.bookings.find((x) => x.code.toUpperCase() === c);
    if (!b) return { ok: false, reason: "No booking carries that code." };
    const it = b.items.find((i) => i.vendorId === vendorId);
    if (!it) return { ok: false, reason: `That code belongs to another vendor's booking, not ${vendor(vendorId).name}.`, booking: b };
    if (it.status === "redeemed") return { ok: false, reason: `Already redeemed ${fstamp(it.redeemedAt)}.`, booking: b, item: it };
    if (it.status !== "confirmed") return { ok: false, reason: `This stop is ${statusLabel(it.status).toLowerCase()}, so it can't be redeemed.`, booking: b, item: it };
    it.status = "redeemed"; it.redeemedAt = nowIso(); recomputeBooking(b); save();
    return { ok: true, booking: b, item: it };
  }
  function adminEditItem(bookingId, idx, patch) {
    const b = booking(bookingId); const it = b.items[idx]; if (!it) return b;
    if (patch.remove) { it.status = "declined"; it.declineReason = patch.reason || "Removed by Dusk"; refundItem(b, it, it.declineReason); }
    else { if (patch.price != null) it.price = patch.price; if (patch.time) it.time = patch.time; if (patch.date) it.date = patch.date; it.editedBy = "admin"; }
    b.total = b.items.reduce((s, i) => s + i.price, 0);
    const pay = payment(b.paymentId); if (pay && !patch.remove) pay.amount = b.total;
    recomputeBooking(b); state.log.unshift({ at: nowIso(), text: `Admin edited ${b.code}` }); save(); return b;
  }
  function adminRefund(paymentId, amount, reason) {
    const pay = payment(paymentId); if (!pay) return null;
    const amt = Math.min(amount, pay.amount - (pay.refundAmount || 0)); if (amt <= 0) return pay;
    pay.refundAmount = (pay.refundAmount || 0) + amt; pay.status = pay.refundAmount >= pay.amount ? "refunded" : "partially_refunded"; pay.refundReason = reason;
    const b = booking(pay.bookingId);
    if (b && pay.status === "refunded") { b.items.forEach((i) => { if (i.status !== "redeemed") { i.status = "cancelled"; i.refunded = i.price; } }); b.status = "refunded"; }
    if (pay.userId === me()) { addTx({ type: "refund", amount: amt, title: `Refund, ${b ? b.title : "tickets"}`, bookingId: pay.bookingId }); if (pay.method === "Wallet") state.profile.walletBalance += amt; }
    state.log.unshift({ at: nowIso(), text: `Refunded ${money(amt)} on ${pay.id}: ${reason || "no reason given"}` });
    save(); return pay;
  }

  /* ---------- tickets ---------- */
  function expireHolds() {
    let changed = false;
    state.tickets.forEach((t) => { if (t.status === "held" && t.holdUntil && t.holdUntil < Date.now()) { t.status = "released"; const e = event(t.eventId); if (e) e.held = Math.max(0, e.held - t.qty); changed = true; } });
    if (changed) save();
  }
  function holdTickets(eventId, qty) {
    const e = event(eventId); const left = e.capacity - e.sold - e.held;
    if (qty > left) return { ok: false, reason: `Only ${left} left.` };
    const t = { id: uid("t"), userId: me(), eventId, qty, status: "held", code: code("TKT"), holdUntil: Date.now() + 10 * 60 * 1000 };
    e.held += qty; state.tickets.unshift(t); save(); return { ok: true, ticket: t };
  }
  function payTickets(ticketId, method) {
    const t = ticket(ticketId); const e = event(t.eventId); if (!t || t.status !== "held") return { ok: false, reason: "The hold has expired." };
    const amount = e.price * t.qty;
    if (method === "Wallet" && state.profile.walletBalance < amount) return { ok: false, reason: "Wallet balance too low." };
    t.status = "paid"; t.paidAt = nowIso(); delete t.holdUntil; e.held = Math.max(0, e.held - t.qty); e.sold += t.qty; if (e.sold >= e.capacity) e.status = "sold_out";
    const pay = { id: uid("p"), bookingId: null, ticketId: t.id, userId: me(), amount, method, status: "succeeded", at: nowIso(), refundAmount: 0, kind: "tickets" };
    t.paymentId = pay.id; state.payments.unshift(pay);
    if (method === "Wallet") state.profile.walletBalance -= amount;
    if (amount > 0) { addTx({ type: "payment", amount: -amount, title: `${e.title}, ${plural(t.qty, "ticket")}` }); state.profile.points += Math.round(amount / 100); }
    save(); return { ok: true, ticket: t };
  }
  function releaseHold(ticketId) { const t = ticket(ticketId); if (!t || t.status !== "held") return; t.status = "released"; const e = event(t.eventId); e.held = Math.max(0, e.held - t.qty); save(); }
  function checkIn(codeStr, eventId) {
    const c = (codeStr || "").trim().toUpperCase();
    const t = state.tickets.find((x) => x.code.toUpperCase() === c);
    if (!t) return { ok: false, reason: "No ticket carries that code." };
    if (eventId && t.eventId !== eventId) return { ok: false, reason: `That ticket is for ${event(t.eventId).title}, not tonight's door.`, ticket: t };
    if (t.status === "checked_in") return { ok: false, reason: `Already checked in at ${ftime(t.checkedInAt)}.`, ticket: t };
    if (t.status !== "paid") return { ok: false, reason: `Ticket is ${statusLabel(t.status).toLowerCase()}, not paid.`, ticket: t };
    t.status = "checked_in"; t.checkedInAt = nowIso(); save(); return { ok: true, ticket: t };
  }

  /* ---------- wallet, profile, support, feedback ---------- */
  function topUp(amount, method) { state.profile.walletBalance += amount; addTx({ type: "topup", amount, title: `Top-up from ${method}` }); save(); }
  function submitFeedback(bookingId, rating, text) {
    const f = { id: uid("f"), userId: me(), bookingId, rating, text, at: nowIso() };
    state.feedback.unshift(f); state.profile.points += 50; addTx({ type: "points", amount: 0, points: 50, title: "Feedback bonus" }); save(); return f;
  }
  function supportNew(subject, text, bookingId) {
    const s = { id: uid("s"), userId: me(), subject, bookingId: bookingId || null, status: "open", updatedAt: nowIso(), messages: [{ from: "user", text, at: nowIso() }] };
    state.supportThreads.unshift(s); save(); return s;
  }
  function supportReply(threadId, text) {
    const s = state.supportThreads.find((x) => x.id === threadId); s.messages.push({ from: "user", text, at: nowIso() }); s.updatedAt = nowIso(); if (s.status === "resolved") s.status = "open"; save(); return s;
  }
  function supportAuto(threadId) {
    const s = state.supportThreads.find((x) => x.id === threadId); const last = s.messages[s.messages.length - 1].text.toLowerCase();
    let text;
    if (s.status === "handed_off") text = "Dana here, I've seen your message and will get back to you within the hour.";
    else if (/refund|charge|money|card/.test(last)) text = "I've checked the payment: nothing is stuck on our side. Want me to bring in a colleague to confirm with the bank?";
    else if (/move|change|time|reschedule|later|earlier/.test(last)) text = "I can ask the vendor to move it. Which time works, and should I shift the stops after it too?";
    else if (/cancel/.test(last)) text = "You can cancel from the booking screen. More than 24 hours before the first stop, the refund is in full.";
    else text = "Got it. I'll sort that with the vendor and confirm here in a few minutes.";
    s.messages.push({ from: s.status === "handed_off" ? "agent" : "concierge", text, at: nowIso() }); s.updatedAt = nowIso(); save(); return s;
  }
  function supportHandoff(threadId) {
    const s = state.supportThreads.find((x) => x.id === threadId); s.status = "handed_off"; s.messages.push({ from: "agent", text: "Hi, Dana from Dusk. I've read the thread and I'm on it. You'll hear from me here.", at: nowIso() }); s.updatedAt = nowIso(); save(); return s;
  }
  function supportResolve(threadId) { const s = state.supportThreads.find((x) => x.id === threadId); s.status = "resolved"; s.updatedAt = nowIso(); save(); return s; }

  /* ---------- vendor and admin ---------- */
  function toggleSlot(slotId) { const s = state.availability.find((x) => x.id === slotId); s.open = !s.open; save(); return s; }
  function addSlot(vendorId, date, time, capacity) { const s = { id: uid("a"), vendorId, date, time, capacity, booked: 0, open: true }; state.availability.push(s); state.availability.sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time)); save(); return s; }
  function saveOffer(patch) {
    let o = patch.id ? offer(patch.id) : null;
    if (!o) { o = { id: uid("o"), vendorId: patch.vendorId, title: "", price: 0, unit: "per person", duration: 60, status: "draft", tags: [], description: "" }; state.offers.push(o); }
    Object.assign(o, patch); save(); return o;
  }
  function saveEvent(patch) {
    let e = patch.id ? event(patch.id) : null;
    if (!e) { e = { id: uid("e"), title: "", vendorId: "v1", venue: "", date: day(7), time: "20:00", price: 0, capacity: 50, sold: 0, held: 0, status: "on_sale", description: "" }; state.events.push(e); }
    Object.assign(e, patch); save(); return e;
  }
  function setVendorStatus(vendorId, status, reason) { const v = vendor(vendorId); v.status = status; v.statusReason = reason || ""; if (status === "active") state.offers.filter((o) => o.vendorId === vendorId && o.status === "draft").forEach((o) => { o.status = "active"; }); state.log.unshift({ at: nowIso(), text: `${v.name} set to ${status}` }); save(); return v; }
  function saveVendor(patch) { const v = vendor(patch.id); Object.assign(v, patch); save(); return v; }
  function setUserStatus(userId, status, reason) { const u = user(userId); u.status = status; u.statusReason = reason || ""; save(); return u; }
  function saveUser(patch) { const u = user(patch.id); Object.assign(u, patch); if (u.id === me()) { state.profile.name = u.name; state.profile.email = u.email; state.profile.phone = u.phone; } save(); return u; }
  function saveProfile(patch) { Object.assign(state.profile, patch); const u = user(me()); if (u) { u.name = state.profile.name; u.email = state.profile.email; u.phone = state.profile.phone; } save(); }

  function bookingsForVendor(vendorId) {
    return state.bookings.filter((b) => b.items.some((i) => i.vendorId === vendorId)).map((b) => ({ booking: b, items: b.items.filter((i) => i.vendorId === vendorId) }));
  }
  function userStats(userId) {
    const bs = state.bookings.filter((b) => b.userId === userId);
    return { bookings: bs.length, spent: bs.filter((b) => b.status !== "cancelled" && b.status !== "refunded").reduce((s, b) => s + b.total, 0) };
  }
  function reportTotals() {
    const paid = state.payments.filter((p) => p.status === "succeeded" || p.status === "partially_refunded");
    const gmv = paid.reduce((s, p) => s + p.amount - (p.refundAmount || 0), 0);
    const byCat = {};
    state.bookings.forEach((b) => { if (b.status === "cancelled" || b.status === "refunded") return; b.items.forEach((i) => { if (i.status === "declined" || i.status === "cancelled") return; const c = vendor(i.vendorId).category; byCat[c] = (byCat[c] || 0) + i.price; }); });
    const byVendor = {};
    state.bookings.forEach((b) => { b.items.forEach((i) => { if (i.status === "declined" || i.status === "cancelled") return; byVendor[i.vendorId] = (byVendor[i.vendorId] || 0) + i.price; }); });
    const commission = Object.entries(byVendor).reduce((s, [vid, amt]) => s + amt * vendor(vid).commission / 100, 0);
    return { gmv, byCat, byVendor, commission, refunds: state.payments.reduce((s, p) => s + (p.refundAmount || 0), 0) };
  }

  /* ---------- small presenters shared by both surfaces ---------- */
  const vendorMeta = (v) => `${v.category} · ${v.area}${v.rating ? " · " + v.rating.toFixed(1) : ""}`;
  function bookingWhen(b) {
    const dates = [...new Set(b.items.map((i) => i.date))].sort();
    return dates.length > 1 ? `${fdate(dates[0])} – ${fdate(dates[dates.length - 1])}` : fdate(dates[0]);
  }
  const liveItems = (b) => b.items.filter((i) => i.status !== "declined" && i.status !== "cancelled");
  const stops = (b) => plural(liveItems(b).length, "stop");
  const firstDate = (b) => b.items.map((i) => i.date).sort()[0];
  function nextBooking() {
    return myBookings().filter((b) => ["confirmed", "pending", "partial"].includes(b.status) && daysUntil(firstDate(b)) >= 0)
      .sort((a, b) => firstDate(a).localeCompare(firstDate(b)))[0];
  }
  const timeLeft = (ms) => { const s = Math.max(0, Math.floor(ms / 1000)); return `${Math.floor(s / 60)}:${pad(s % 60)}`; };
  const daysAhead = (n) => Array.from({ length: n }, (_, i) => day(i));
  const ticketsLeft = (e) => Math.max(0, e.capacity - e.sold - e.held);

  /* ---------- web table: one sortable, paged, responsive table for every list screen ----------
     Every web list renders through this so sorting, paging and the under-768px card fallback behave
     the same everywhere. `cols` = [{ key, label, num, render(row), sort(row) }]; `href(row)` makes the
     row a link; `card(row)` = { title, meta, right } for the phone layout; `empty` is the empty state. */
  function webTable(host, o) {
    const st = { sort: o.sort || (o.cols[0] && o.cols[0].key), dir: o.dir || "asc", page: 0, size: o.pageSize || 10 };
    function draw() {
      let rows = (typeof o.rows === "function" ? o.rows() : o.rows).slice();
      const col = o.cols.find((c) => c.key === st.sort);
      if (col) { const val = col.sort || ((r) => r[col.key]); rows.sort((a, b) => { const x = val(a), y = val(b); const c = typeof x === "number" && typeof y === "number" ? x - y : String(x ?? "").localeCompare(String(y ?? "")); return st.dir === "asc" ? c : -c; }); }
      const total = rows.length, pages = Math.max(1, Math.ceil(total / st.size)); st.page = Math.min(st.page, pages - 1);
      const slice = rows.slice(st.page * st.size, (st.page + 1) * st.size);
      if (!total) { host.innerHTML = o.empty || `<div class="empty panel"><h3>Nothing here</h3></div>`; return; }
      const arrow = (c) => c.key === st.sort ? icon(st.dir === "asc" ? "chevron-up" : "chevron-down", "sm") : "";
      host.innerHTML = `<div class="table-wrap responsive"><table class="table"><thead><tr>${o.cols.map((c) => `<th class="${c.num ? "num" : ""} ${c.key === st.sort ? "sorted" : ""}"><button type="button" data-sort="${c.key}" aria-sort="${c.key === st.sort ? (st.dir === "asc" ? "ascending" : "descending") : "none"}">${esc(c.label)}${arrow(c)}</button></th>`).join("")}</tr></thead>
        <tbody class="stagger">${slice.map((r, i) => `<tr class="${o.href ? "link" : ""}" ${o.href ? `data-href="${o.href(r)}"` : ""} style="--i:${Math.min(i, 14)}">${o.cols.map((c, j) => `<td class="${j === 0 ? "primary" : ""} ${c.num ? "num" : ""}">${c.render ? c.render(r) : esc(String(r[c.key] ?? ""))}</td>`).join("")}</tr>`).join("")}</tbody></table>
        ${pages > 1 || total > st.size ? `<div class="pager"><span>${st.page * st.size + 1}–${Math.min(total, (st.page + 1) * st.size)} of ${total}</span><span class="flex gap-1"><button class="btn btn-ghost btn-sm" data-page="-1" ${st.page === 0 ? "disabled" : ""}>Previous</button><button class="btn btn-ghost btn-sm" data-page="1" ${st.page >= pages - 1 ? "disabled" : ""}>Next</button></span></div>` : `<div class="pager"><span>${plural(total, "row")}</span></div>`}</div>
        <div class="cards-md stagger">${slice.map((r, i) => { const c = o.card ? o.card(r) : { title: o.cols[0].render ? o.cols[0].render(r) : r[o.cols[0].key], meta: "" }; return `<${o.href ? `a href="${o.href(r)}"` : "div"} class="mcard pressable" style="--i:${Math.min(i, 14)}"><div class="top"><span class="font-medium truncate" style="color:var(--bone)">${c.title}</span><span style="flex:none">${c.right || ""}</span></div>${c.meta ? `<div class="meta truncate">${c.meta}</div>` : ""}</${o.href ? "a" : "div"}>`; }).join("")}${pages > 1 ? `<div class="pager" style="border:0"><span>${st.page * st.size + 1}–${Math.min(total, (st.page + 1) * st.size)} of ${total}</span><span class="flex gap-1"><button class="btn btn-ghost btn-sm" data-page="-1" ${st.page === 0 ? "disabled" : ""}>Previous</button><button class="btn btn-ghost btn-sm" data-page="1" ${st.page >= pages - 1 ? "disabled" : ""}>Next</button></span></div>` : ""}</div>`;
    }
    on(host, "click", "[data-sort]", (e, b) => { if (st.sort === b.dataset.sort) st.dir = st.dir === "asc" ? "desc" : "asc"; else { st.sort = b.dataset.sort; st.dir = "asc"; } draw(); });
    on(host, "click", "[data-page]", (e, b) => { st.page += Number(b.dataset.page); draw(); });
    on(host, "click", "tr[data-href]", (e, tr) => { if (e.target.closest("a, button")) return; location.href = tr.dataset.href; });
    draw();
    return { draw, state: st };
  }

  expireHolds();

  window.BL = {
    webTable,
    vendorMeta, bookingWhen, liveItems, stops, firstDate, nextBooking, timeLeft, daysAhead, ticketsLeft,
    KEY, state, save, reset, uid, code, TODAY, day, nowIso, parseIso, daysUntil,
    money, fdate, fstamp, ftime, esc, qs, initials, plural, icon, ICONS, badge, statusLabel, STATUS, budgetStatus,
    offer, vendor, event, booking, user, payment, ticket, plan, me, myBookings, myTickets, categoryIcon, itemPrice, vendorRating, priceLevel,
    render, on, toast, leave, countUp, qr, dialog, sheet, modal, confirm,
    ios: { shell: iosShell, sheet, tabs: IOS_TABS }, web: { shell: webShell, nav: WEB_NAV, home: ROLE_HOME, dialog },
    conciergeSend, conciergeReply, parseRequest, buildPlan, alternativesFor, swapPlanItem, removePlanItem, addPlanItem, setPlanGuests, cheaperAlternative,
    bookingShape, budgetText, shortlist, reservePlan, holdPlan, acceptRequote, releasePlanHolds, rememberPreference, forgetPreference, planDays, applyUpgrade, resetChat,
    payPlan, settlePending, vendorDecide, cancelBooking, redeemCode, adminEditItem, adminRefund, recomputeBooking,
    expireHolds, holdTickets, payTickets, releaseHold, checkIn,
    topUp, submitFeedback, supportNew, supportReply, supportAuto, supportHandoff, supportResolve,
    toggleSlot, addSlot, saveOffer, saveEvent, setVendorStatus, saveVendor, setUserStatus, saveUser, saveProfile,
    bookingsForVendor, userStats, reportTotals,
  };
})();
