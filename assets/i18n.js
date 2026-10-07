/* Hebrew for every screen. The pages are written in English; this layer swaps what the member,
   vendor or admin reads for Hebrew and flips the layout to right-to-left.

   How it works: the language lives under its own localStorage key, so a demo reset never changes
   it. When Hebrew is on, the document gets dir="rtl" and lang="he" before anything paints, and a
   MutationObserver translates every text node and label-bearing attribute as the screens render
   and re-render. Exact strings come from DICT; composed strings (prices, names, counts) match a
   PATTERN with {n} slots; anything else is split on " · " and on sentence ends and tried again.
   Demo records keep their English in the store, so the concierge's parsing is untouched; the
   screen shows the Hebrew. Loaded before app.js on every page. Classic script, works on file://. */
(function () {
  "use strict";
  const LANG_KEY = "blissers.lang";
  let lang = "en";
  /* ?lang=he or ?lang=en on any URL picks the language and keeps it, so a link into the demo
     can open it in Hebrew without a tap. The two-option control on the sign-in screens is the
     normal way in; this is for links and for the portal's preview. */
  try {
    const asked = new URLSearchParams(location.search).get("lang");
    if (asked === "he" || asked === "en") localStorage.setItem(LANG_KEY, asked);
    lang = localStorage.getItem(LANG_KEY) === "he" ? "he" : "en";
  } catch (e) { /* storage blocked: stay English */ }
  const root = document.documentElement;
  root.lang = lang;
  root.dir = lang === "he" ? "rtl" : "ltr";

  const api = {
    lang, LANG_KEY,
    other: lang === "he" ? "en" : "he",
    otherLabel: lang === "he" ? "English" : "עברית",
    set(l) { try { localStorage.setItem(LANG_KEY, l === "he" ? "he" : "en"); } catch (e) { /* ignore */ } location.reload(); },
    toggle() { api.set(api.other); },
    t: (s) => s,
    toEnglish: (s) => s,
  };
  window.BLI18N = api;

  /* A language control anywhere: <button data-lang="he"> or <button data-lang="toggle">. */
  document.addEventListener("click", (e) => {
    const b = e.target.closest && e.target.closest("[data-lang]");
    if (!b) return;
    e.preventDefault();
    const l = b.dataset.lang;
    if (l === "toggle") api.toggle(); else api.set(l);
  });

  /* Static controls name the other language: <span data-lang-label> and [data-lang="xx"] buttons. */
  document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll("[data-lang-label]").forEach((el) => { el.textContent = api.otherLabel; });
    document.querySelectorAll("[data-lang]").forEach((b) => {
      if (b.dataset.lang === "toggle") return;
      const on = b.dataset.lang === lang;
      b.classList.toggle("is-on", on);
      b.setAttribute("aria-pressed", on ? "true" : "false");
    });
  });

  if (lang !== "he") return;

  /* ---------- exact strings ---------- */
  const DICT = {
    /* brand, nav, shell */
    "Blissers": "Blissers", "Sign in": "כניסה", "Sign out": "יציאה", "Continue": "המשך", "Email": "אימייל", "Password": "סיסמה",
    "Mobile app": "אפליקציית מובייל", "Web app": "אפליקציית ווב", "Member": "חבר", "Vendor": "ספק", "Admin": "מנהל", "Back": "חזרה",
    "Home": "בית", "Concierge": "קונסיירז׳", "Bookings": "הזמנות", "Events": "אירועים", "Profile": "פרופיל", "Explore": "גלה", "Wallet": "ארנק",
    "Dashboard": "לוח בקרה", "Availability": "זמינות", "Redemption": "מימוש", "Offers": "הצעות", "Check-in": "צ׳ק-אין", "Users": "משתמשים",
    "Vendors": "ספקים", "Catalog": "קטלוג", "Catalogue": "קטלוג", "Payments": "תשלומים", "Reports": "דוחות", "Back office": "משרד אחורי",
    "Search": "חיפוש", "Search…": "חיפוש…", "Main": "ראשי", "Primary": "ראשי", "Sidebar": "סרגל צד", "Open menu": "פתח תפריט", "Close menu": "סגור תפריט",
    "Skip to content": "דלג לתוכן", "Switch role": "החלף תפקיד", "Reset demo data": "אפס נתוני דמו", "Reset demo data?": "לאפס את נתוני הדמו?",
    "Every booking, ticket and change made in this session goes back to the seeded state.": "כל הזמנה, כרטיס ושינוי שנעשו בסשן הזה חוזרים למצב ההתחלתי.",
    "Reset": "אפס", "Open the mobile app": "פתח את אפליקציית המובייל",
    "Back to the seeded state": "חזרה למצב ההתחלתי", "Viewing as": "מציג בתור", "Vendor and Admin open the web app in this browser.": "ספק ומנהל פותחים את אפליקציית הווב בדפדפן הזה.",
    "Language": "שפה", "English": "English", "Hebrew": "עברית",
    "Close": "סגור", "Cancel": "ביטול", "Confirm": "אשר", "Keep it": "השאר", "Done": "סיום", "Save": "שמור", "Edit": "ערוך", "Remove": "הסר", "Yes": "כן", "No": "לא",
    "OK": "אישור", "Got it": "הבנתי", "More": "עוד", "New": "חדש", "All": "הכול", "Show": "הצג", "Copy code": "העתק קוד", "Code copied": "הקוד הועתק",
    "Escape": "Escape", "Enter": "Enter", "Backspace": "Backspace", "Saved": "נשמר", "Added": "נוסף", "Free": "חינם", "Open": "פתוח", "Closed": "סגור", "Full": "מלא",
    "Today": "היום", "Tomorrow": "מחר", "Yesterday": "אתמול", "Tonight": "הערב", "A night": "ערב", "for two": "לשניים", "Day": "יום", "When": "מתי", "Date": "תאריך", "Time": "שעה",
    "Name": "שם", "Phone": "טלפון", "City": "עיר", "Area": "אזור", "Status": "סטטוס", "Type": "סוג", "Amount": "סכום", "From": "מאת", "Reference": "אסמכתה", "Total": "סה״כ",
    "Price": "מחיר", "Title": "כותרת", "Description": "תיאור", "Tags": "תגיות", "Venue": "מקום", "Length": "משך", "Sold": "נמכרו", "Rate": "דירוג", "Rating": "דירוג",
    "Role": "תפקיד", "Joined": "הצטרף", "Spent": "הוצאות", "Kind": "סוג", "Method": "אמצעי", "Net": "נטו", "Taken": "נגבה", "Charge": "חיוב", "For": "עבור", "Reason": "סיבה",
    "Charged": "חיוב", "Priced": "תמחור", "Source": "מקור", "Stops": "תחנות", "Guests": "אורחים", "Guest": "אורח", "Buyer": "קונה", "Seats": "מקומות", "Edited": "נערך",
    "Code": "קוד", "Paid": "שולם", "Pending": "ממתין", "Failed": "נכשל", "Success": "הצלחה", "Refund": "החזר", "Refunds": "החזרים", "Refunded": "הוחזר", "Points": "נקודות",
    "Top-up": "טעינה", "Top-ups": "טעינות", "Top up": "טען", "Subscription": "מנוי", "Everything": "הכול", "Activity": "פעילות", "Balance": "יתרה", "Default": "ברירת מחדל",
    "Upcoming": "קרוב", "Past": "עבר", "Cancelled": "בוטל", "Booked": "הוזמן", "Review": "סקירה", "Reserve": "הזמן", "Reserve anyway": "הזמן בכל זאת", "Book": "הזמן", "Book it": "הזמן",
    "Pay": "שלם", "Plan": "תוכנית", "Ticket": "כרטיס", "Tickets": "כרטיסים", "Event": "אירוע", "Offer": "הצעה", "Place": "מקום", "Places": "מקומות", "Booking": "הזמנה", "Payment": "תשלום",
    "Support": "תמיכה", "Feedback": "משוב", "Help": "עזרה", "Options": "אפשרויות", "Details": "פרטים", "Capacity": "קיבולת", "Left": "נותרו", "Over": "הסתיים", "Inside": "בפנים", "Expected": "צפויים",
    "Member view": "תצוגת חבר", "Standard": "רגיל", "Black": "בלאק", "Plus": "פלוס", "Premium": "פרימיום", "Visa": "ויזה", "Mastercard": "מאסטרקארד", "Amex": "אמקס", "Apple Pay": "Apple Pay",
    "Bank transfer": "העברה בנקאית", "Weekly bank transfer": "העברה בנקאית שבועית", "Monthly bank transfer": "העברה בנקאית חודשית",
    "Active": "פעיל", "Paused": "מושהה", "Draft": "טיוטה", "On sale": "במכירה", "Sold out": "אזל", "Suspended": "מושעה", "Invited": "הוזמן", "Held": "מוחזק", "Released": "שוחרר",
    "Checked in": "נכנס", "With an agent": "אצל נציג", "Resolved": "נפתר", "Declined": "נדחה", "Completed": "הושלם", "Awaiting vendor": "ממתין לספק", "Partly confirmed": "אושר חלקית",
    "Partly refunded": "הוחזר חלקית", "Awaiting review": "ממתין לבדיקה", "Confirmed": "אושר", "No hold": "ללא החזקה", "Redeemed": "מומש", "Not redeemed": "לא מומש", "Not admitted": "לא הוכנס",
    "Card declined": "הכרטיס נדחה", "Card declined by issuer": "הכרטיס נדחה על ידי המנפיק", "Card declined by issuer.": "הכרטיס נדחה על ידי המנפיק.", "Wallet balance too low": "יתרת הארנק נמוכה מדי",
    "Wallet balance too low.": "יתרת הארנק נמוכה מדי.", "The bank declined it.": "הבנק דחה את החיוב.", "No charge for a free event.": "אין חיוב על אירוע חינם.", "Insufficient funds": "אין כיסוי",
    "Bank timed out": "הבנק לא ענה בזמן", "3-D Secure not completed": "אימות 3-D Secure לא הושלם", "Pending at the bank": "ממתין לבנק", "Payment failed": "התשלום נכשל",
    /* categories, areas, cities */
    "Dining": "מסעדות", "Wellness": "ספא ורוגע", "Nightlife": "חיי לילה", "Sea & Outdoors": "ים וחוץ", "Culture": "תרבות", "Workshops": "סדנאות", "Stays": "לינה", "Stay": "לינה",
    "Food": "אוכל", "Activities": "פעילויות", "Buffer": "רזרבה", "Hotel": "מלון",
    "Tel Aviv": "תל אביב", "Jaffa": "יפו", "Herzliya": "הרצליה", "Ramat Gan": "רמת גן", "Givatayim": "גבעתיים", "Haifa": "חיפה", "Jerusalem": "ירושלים", "Bat Yam": "בת ים",
    "Sarona": "שרונה", "Neve Tzedek": "נווה צדק", "Allenby": "אלנבי", "Jaffa Port": "נמל יפו", "Florentin": "פלורנטין", "Rothschild": "רוטשילד", "Jaffa Flea Market": "שוק הפשפשים",
    "Gordon Beach": "חוף גורדון", "White City": "העיר הלבנה", "Dizengoff": "דיזנגוף", "Levinsky": "לוינסקי", "Tel Aviv Port": "נמל תל אביב", "Dizengoff Square": "כיכר דיזנגוף",
    "Sarona Market hall": "אולם שוק שרונה", "Jaffa Port, pier 3": "נמל יפו, רציף 3", "Alma Bar courtyard": "החצר של אלמה בר", "Port of Tel Aviv, Hangar 11": "נמל תל אביב, האנגר 11",
    /* vendors */
    "Claro": "קלארו", "Mantra Spa": "מנטרה ספא", "Alma Bar": "אלמה בר", "Sea & Sun Sailing": "ים ושמש שייט", "Nava Yoga Loft": "נאוה יוגה לופט", "Teder Rooftop": "טדר רופטופ",
    "Hall 21": "אולם 21", "Ceramics by Noa": "קרמיקה של נועה", "Casa Blanca Hotel": "מלון קאזה בלנקה", "Yafo Grill": "יפו גריל", "Gordon Surf Club": "מועדון הגלישה גורדון",
    "City Walks TLV": "סיורי העיר TLV", "Vino Vino": "וינו וינו", "Hamam Levinsky": "חמאם לוינסקי", "Lola Cocktails": "לולה קוקטיילים",
    "Seasonal Mediterranean kitchen in a restored Templer house. Open fire, local produce, a long wine list.": "מטבח ים-תיכוני עונתי בבית טמפלרי משוחזר. אש גלויה, תוצרת מקומית, רשימת יינות ארוכה.",
    "Hammam, treatment rooms and a quiet courtyard two streets from the sea.": "חמאם, חדרי טיפולים וחצר שקטה שני רחובות מהים.",
    "Courtyard bar with a late kitchen and a different DJ every night of the week.": "בר חצר עם מטבח עד מאוחר ודי-ג׳יי אחר בכל ערב בשבוע.",
    "Two sailing yachts out of the old port. Sunset sails daily, private charters by request.": "שתי יאכטות מפרש מהנמל הישן. שייט שקיעה מדי יום, הפלגות פרטיות לפי בקשה.",
    "Rooftop classes at sunrise and sunset, sound baths on Thursdays.": "שיעורי גג בזריחה ובשקיעה, אמבטיות צליל בימי חמישי.",
    "Open-air rooftop over the boulevard. Cinema on Wednesdays, DJs at the weekend.": "גג פתוח מעל השדרה. קולנוע בימי רביעי, די-ג׳ייז בסוף השבוע.",
    "Independent stage for dance and new theatre. Two shows a night, Thursday to Saturday.": "במה עצמאית למחול ותיאטרון חדש. שתי הצגות בערב, חמישי עד שבת.",
    "Small studio with six wheels. Tasters for beginners, evening glazing sessions with wine.": "סטודיו קטן עם שישה אובניים. טעימות למתחילים, ערבי זיגוג עם יין.",
    "Twenty-four rooms around a garden pool, a short walk from the beach.": "עשרים וארבעה חדרים סביב בריכת גן, הליכה קצרה מהחוף.",
    "Charcoal grill and a mezze table that keeps coming. Loud, fast, loved.": "גריל פחמים ושולחן מזה שלא נגמר. רועש, מהיר, אהוב.",
    "Surf and SUP lessons from the beach hut, boards and wetsuits included.": "שיעורי גלישה וסאפ מהבקתה בחוף, גלשנים וחליפות כלולים.",
    "Guided walks through Bauhaus boulevards, Florentin street art and the Jaffa alleys.": "סיורים מודרכים בשדרות הבאוהאוס, אמנות הרחוב של פלורנטין וסמטאות יפו.",
    "Natural wine bar with a small plates menu. Applied last week.": "בר יין טבעי עם תפריט מנות קטנות. הגיש בקשה בשבוע שעבר.",
    "Traditional hammam with a modern treatment menu. Documents uploaded, awaiting review.": "חמאם מסורתי עם תפריט טיפולים מודרני. המסמכים הועלו, ממתין לבדיקה.",
    "Suspended after three unresolved no-shows in September.": "הושעה אחרי שלוש אי-הגעות לא פתורות בספטמבר.",
    "Three confirmed bookings refused at the door, 12–19 Sep.": "שלוש הזמנות מאושרות נדחו בכניסה, 12–19 בספטמבר.",
    "Reception 24h": "קבלה 24 שעות", "Chargeback on two bookings in August.": "ביטול חיוב על שתי הזמנות באוגוסט.", "Chargeback on two bookings": "ביטול חיוב על שתי הזמנות",
    /* offers */
    "Tasting menu for two": "תפריט טעימות לשניים", "Chef's counter lunch": "ארוחת צהריים בדלפק השף", "Signature massage, 60 min": "עיסוי החתימה, 60 דק׳", "Couples spa ritual": "טקס ספא זוגי",
    "Reserved table and welcome drinks": "שולחן שמור ומשקאות קבלת פנים", "Sunset sail": "שייט שקיעה", "Private yacht, 3 hours": "יאכטה פרטית, 3 שעות", "Rooftop sunset yoga": "יוגת שקיעה על הגג",
    "Sound bath": "אמבטיית צליל", "Rooftop DJ night entry": "כניסה לערב די-ג׳יי על הגג", "Contemporary dance evening": "ערב מחול עכשווי", "Wheel throwing taster": "טעימת אובניים",
    "Glaze and sip evening": "ערב זיגוג ויין", "Garden suite, one night": "סוויטת גן, לילה אחד", "Mezze feast": "חגיגת מזה", "Beginner surf lesson": "שיעור גלישה למתחילים",
    "SUP at sunrise": "סאפ בזריחה", "Bauhaus walking tour": "סיור באוהאוס רגלי", "Street art of Florentin": "אמנות הרחוב של פלורנטין", "Hot stone express, 30 min": "אבנים חמות אקספרס, 30 דק׳",
    "Wine pairing add-on": "תוספת התאמת יינות", "Natural wine flight": "טיסת יינות טבעיים", "Chef’s counter tasting": "טעימות בדלפק השף", "Rooftop sunset session": "מפגש שקיעה על הגג",
    "Seven courses from the open fire, paired with the day's market. Seated at 19:30 or 21:00.": "שבע מנות מהאש הגלויה, בהתאמה לשוק היומי. ישיבה ב-19:30 או 21:00.",
    "Four courses at the counter, watching the pass. Weekdays only.": "ארבע מנות בדלפק, מול הפס. בימי חול בלבד.",
    "Deep tissue or Swedish, followed by tea in the courtyard.": "רקמות עמוקות או שוודי, ואחריו תה בחצר.",
    "Hammam, scrub and a side-by-side massage in the garden room.": "חמאם, פילינג ועיסוי זה לצד זה בחדר הגן.",
    "A courtyard table held for you, two cocktails each on arrival.": "שולחן בחצר שמור לכם, שני קוקטיילים לכל אחד בהגעה.",
    "Two hours along the coast with wine and snacks on board. Leaves 90 minutes before sunset.": "שעתיים לאורך החוף עם יין וחטיפים על הסיפון. יוצא 90 דקות לפני השקיעה.",
    "The whole boat, a skipper, and the route you choose.": "כל הסירה, סקיפר, והמסלול שתבחרו.",
    "Slow flow on the roof as the light goes. Mats provided.": "פלואו איטי על הגג כשהאור דועך. מזרנים מסופקים.",
    "Gongs and bowls, lying down, lights off. Thursdays at 20:00.": "גונגים וקערות, בשכיבה, אורות כבויים. ימי חמישי ב-20:00.",
    "Skip the queue with a first drink included.": "דלגו על התור, משקה ראשון כלול.",
    "Two short pieces by resident companies, with a talk afterwards.": "שתי יצירות קצרות של להקות הבית, ושיחה אחריהן.",
    "Two hours on the wheel, two pieces fired and glazed for you to collect.": "שעתיים על האובניים, שני כלים נשרפים ומזוגגים לאיסוף.",
    "Glaze a ready-made piece with a glass of wine in hand.": "זגגו כלי מוכן עם כוס יין ביד.",
    "Suite with a private terrace onto the garden. Breakfast included.": "סוויטה עם מרפסת פרטית אל הגן. ארוחת בוקר כלולה.",
    "The full table: twenty salads, grilled meats, fresh pita. Nobody leaves hungry.": "השולחן המלא: עשרים סלטים, בשרים על האש, פיתה טרייה. אף אחד לא יוצא רעב.",
    "Ninety minutes with an instructor, board and wetsuit included.": "תשעים דקות עם מדריך, גלשן וחליפה כלולים.",
    "Paddle out on flat water as the city wakes up.": "חתירה על מים שטוחים בזמן שהעיר מתעוררת.",
    "The White City's best facades and the stories behind them.": "החזיתות היפות של העיר הלבנה והסיפורים מאחוריהן.",
    "Murals, stencils and the artists who made them, ending at a bar.": "ציורי קיר, שבלונות והאמנים שמאחוריהם, עם סיום בבר.",
    "Paused while the stone room is refitted.": "מושהה בזמן שיפוץ חדר האבנים.", "Five glasses matched to the tasting menu.": "חמש כוסות בהתאמה לתפריט הטעימות.",
    "Four glasses and a plate of cheese. Goes live when the vendor is approved.": "ארבע כוסות וצלחת גבינות. עולה לאוויר כשהספק מאושר.",
    "Evening": "ערב", "Date night": "דייט", "Lunch": "צהריים", "Counter": "דלפק", "Relax": "רוגע", "Couples": "זוגות", "Hammam": "חמאם", "Late": "מאוחר", "Drinks": "משקאות",
    "Sunset": "שקיעה", "Sea": "ים", "Private": "פרטי", "Up to 10": "עד 10", "Rooftop": "גג", "All levels": "כל הרמות", "Thursday": "חמישי", "Weekend": "סוף שבוע", "DJ": "די-ג׳יי",
    "Beginner": "מתחילים", "Hands-on": "ידיים בחומר", "Wine": "יין", "Pool": "בריכה", "Sharing": "לשיתוף", "Morning": "בוקר", "Sunrise": "זריחה", "Calm": "רגוע", "Walk": "הליכה",
    "UNESCO": "אונסק״ו", "Art": "אמנות", "Quick": "מהיר", "Add-on": "תוספת",
    "per couple": "לזוג", "per person": "לאדם", "per night": "ללילה", "per group": "לקבוצה", "per table": "לשולחן", "per session": "למפגש", "Per ticket": "לכרטיס", "Priced for two": "מחיר לשניים",
    "One price for the group": "מחיר אחד לקבוצה",
    /* events */
    "Jaffa Jazz Night": "ערב ג׳אז ביפו", "Sunrise Beach Yoga": "יוגת זריחה בחוף", "Mediterranean Wine Fair": "יריד יינות ים-תיכוני", "White City Architecture Walk": "סיור אדריכלות בעיר הלבנה",
    "Full Moon Sail Party": "מסיבת שייט בירח מלא", "Ceramics Open Studio": "סטודיו פתוח לקרמיקה", "Rooftop Cinema: Classics": "קולנוע על הגג: קלאסיקות", "Autumn Food Market": "שוק אוכל סתווי",
    "Silent Disco on the Pier": "דיסקו שקט על המזח",
    "A quartet from the Jaffa scene, two sets, the courtyard kitchen open until late.": "רביעייה מסצנת יפו, שני סטים, מטבח החצר פתוח עד מאוחר.",
    "Two hundred mats on the sand, one teacher, one sunrise. Coffee after.": "מאתיים מזרנים על החול, מורה אחת, זריחה אחת. קפה אחרי.",
    "Forty producers from Israel, Greece, Lebanon and Italy. Entry includes a glass and twelve tastings.": "ארבעים יקבים מישראל, יוון, לבנון ואיטליה. הכניסה כוללת כוס ושתים-עשרה טעימות.",
    "The monthly walk, this time around Bialik Street and the Pagoda House.": "הסיור החודשי, הפעם סביב רחוב ביאליק ובית הפגודה.",
    "Three hours at anchor off the coast under a full moon. DJ, open bar, swimming if you dare.": "שלוש שעות בעגינה מול החוף תחת ירח מלא. די-ג׳יי, בר פתוח, ושחייה למי שמעז.",
    "Free afternoon in the studio. Watch a firing, try a wheel, buy seconds at half price.": "אחר צהריים חופשי בסטודיו. צפו בשריפה, נסו אובניים, קנו סוג ב׳ בחצי מחיר.",
    "A classic on the big screen, blankets on the chairs, popcorn from the kitchen.": "קלאסיקה על המסך הגדול, שמיכות על הכיסאות, פופקורן מהמטבח.",
    "Forty stalls, one Saturday. Happened last week.": "ארבעים דוכנים, שבת אחת. התקיים בשבוע שעבר.", "Three channels, three DJs, headphones at the door.": "שלושה ערוצים, שלושה די-ג׳ייז, אוזניות בכניסה.",
    /* bookings, support, feedback, wallet seed */
    "Thursday evening for two": "ערב חמישי לשניים", "Mezze lunch in Jaffa": "צהריים של מזה ביפו", "Ceramics Saturday": "שבת של קרמיקה", "Birthday night out": "ערב יום הולדת בחוץ",
    "Weekend in Neve Tzedek": "סוף שבוע בנווה צדק", "Rooftop yoga": "יוגה על הגג", "Surf morning": "בוקר של גלישה", "Bauhaus walk": "סיור באוהאוס", "Street art tour": "סיור אמנות רחוב",
    "Sunset sail for two": "שייט שקיעה לשניים", "Anniversary dinner": "ארוחת יום נישואין", "Massage after work": "עיסוי אחרי העבודה", "Team day on the water": "יום צוות על המים",
    "Dinner at Claro": "ארוחת ערב בקלארו", "Lunch with clients": "צהריים עם לקוחות", "Glaze night": "ערב זיגוג", "Counter lunch": "צהריים בדלפק", "Teacher unwell, session cancelled": "המורה חולה, המפגש בוטל",
    "Move the massage to 18:00?": "להזיז את העיסוי ל-18:00?", "Could the massage on Thursday move to 18:00? We'll be late from work.": "אפשר להזיז את העיסוי של יום חמישי ל-18:00? נאחר מהעבודה.",
    "Mantra Spa has 18:00 free on Thursday. Want me to move it and shift dinner to 20:30?": "במנטרה ספא יש 18:00 פנוי ביום חמישי. להזיז, ולדחות את ארוחת הערב ל-20:30?",
    "Refund for the DJ night": "החזר על ערב הדי-ג׳יי", "The rooftop declined but I still see the charge on my card.": "הגג דחה, אבל אני עדיין רואה את החיוב בכרטיס.",
    "The 360 ₪ refund went back to the card the same day. Banks show it in three to five working days. I'm bringing in a colleague to confirm.": "ההחזר של 360 ₪ חזר לכרטיס באותו יום. בבנקים זה מופיע תוך שלושה עד חמישה ימי עסקים. אני מצרפת קולגה לאישור.",
    "Hi Maya, Dana here. Confirmed on our side, reference RF-5120. If it's not there by Monday, reply here and I'll chase it.": "היי מאיה, דנה כאן. מאושר מהצד שלנו, אסמכתה RF-5120. אם זה לא שם עד יום שני, כתבי כאן ואני אטפל.",
    "Dietary note for the tasting menu": "הערה תזונתית לתפריט הטעימות", "One of us is pescatarian, can Claro adapt?": "אחד מאיתנו פסקטריאן, קלארו יכולים להתאים?",
    "Done, the kitchen has it noted on the reservation.": "סודר, המטבח רשם את זה על ההזמנה.",
    "The lamb was incredible and the table was ready on time.": "הטלה היה מדהים והשולחן היה מוכן בזמן.", "Great instructor, the wetsuit was a bit small.": "מדריך מעולה, החליפה הייתה קצת קטנה.",
    "Perfect anniversary, thank you.": "יום נישואין מושלם, תודה.", "Feedback bonus": "בונוס משוב", "Top-up from Visa •• 4242": "טעינה מויזה •• 4242", "Visa •• 4242": "ויזה •• 4242",
    "Visa •• 1180": "ויזה •• 1180", "Mastercard •• 8810": "מאסטרקארד •• 8810", "Maya Levi": "מאיה לוי", "Daniel Cohen": "דניאל כהן", "Noa Friedman": "נועה פרידמן", "Omer Shalev": "עומר שלו",
    "Tamar Ben-David": "תמר בן-דוד", "Yonatan Peretz": "יונתן פרץ", "Shira Katz": "שירה כץ", "Eitan Mizrahi": "איתן מזרחי", "Lior Avraham": "ליאור אברהם", "Hila Goldberg": "הילה גולדברג",
    "Dana Weiss": "דנה וייס", "Rotem Segal": "רותם סגל", "Avi Rosen": "אבי רוזן", "Yael Mor": "יעל מור", "Tom Harel": "תום הראל", "Gil Ashkenazi": "גיל אשכנזי", "Nava Shani": "נאוה שני",
    "Roni Dayan": "רוני דיין", "Maayan Lev": "מעיין לב", "Noa Barzilai": "נועה ברזילי", "Orit Sela": "אורית סלע", "Sami Khoury": "סמי ח׳ורי", "Daniel Arad": "דניאל ארד", "Leah Katz": "לאה כץ",
    "Michal Oren": "מיכל אורן", "Gal Nahum": "גל נחום", "Ido Barak": "עידו ברק", "Hi": "היי", "Maya": "מאיה",
    /* index */
    "Sign in · Blissers": "כניסה · Blissers", "Say what you want to do. We plan it, book it and pay for it.": "אמרו מה בא לכם לעשות. אנחנו מתכננים, מזמינים ומשלמים.",
    "One concierge, every vendor in the city, one swipe to confirm.": "קונסיירז׳ אחד, כל ספק בעיר, החלקה אחת לאישור.", "Any email and any password open the demo.": "כל אימייל וכל סיסמה פותחים את הדמו.",
    "The member's iPhone: concierge, plans, tickets": "האייפון של החבר: קונסיירז׳, תוכניות, כרטיסים", "Vendor Portal and Back Office": "פורטל ספקים ומשרד אחורי",
    "Demo data is stored in this browser. Reset it from the sidebar or the Profile screen.": "נתוני הדמו נשמרים בדפדפן הזה. איפוס מסרגל הצד או ממסך הפרופיל.",
    /* onboarding */
    "Country code": "קידומת מדינה", "Six-digit code": "קוד בן שש ספרות", "Digit 1": "ספרה 1", "Digit 2": "ספרה 2", "Digit 3": "ספרה 3", "Digit 4": "ספרה 4", "Digit 5": "ספרה 5", "Digit 6": "ספרה 6",
    "One concierge for every evening out, every ticket, every weekend away.": "קונסיירז׳ אחד לכל ערב בחוץ, לכל כרטיס, לכל סוף שבוע.", "Your number": "המספר שלך",
    "We’ll text a six-digit code to sign you in.": "נשלח קוד בן שש ספרות בהודעה לכניסה.", "Mobile number": "מספר נייד", "Enter the number we should text.": "הזינו את המספר שאליו נשלח הודעה.",
    "Text me a code": "שלחו לי קוד", "Continuing accepts the terms and the privacy policy.": "המשך מהווה הסכמה לתנאים ולמדיניות הפרטיות.", "Enter the code": "הזינו את הקוד",
    "Sent to +972 54 123 4567": "נשלח אל +972 54 123 4567", "Any six digits open the demo.": "כל שש ספרות פותחות את הדמו.", "Fill in all six digits.": "מלאו את כל שש הספרות.", "Verify": "אמת",
    "Change number": "שנה מספר", "Resend code": "שלח קוד שוב", "Code sent again": "הקוד נשלח שוב",
    "Set up · Blissers": "הגדרה · Blissers", "About you": "עליך", "Full name": "שם מלא", "We need a name for your bookings.": "צריך שם להזמנות שלך.", "Receipts and plan summaries go here.": "קבלות וסיכומי תוכניות נשלחים לכאן.",
    "Neighbourhood": "שכונה", "What you’re into": "מה מעניין אותך", "Pick as many as you like. Budget, timing and company come up in the chat, only when a plan needs them.": "בחרו כמה שתרצו. תקציב, זמנים וחברה עולים בצ׳אט, רק כשתוכנית צריכה אותם.",
    "Pick at least one.": "בחרו לפחות אחד.", "Finish": "סיום", "you@example.com": "you@example.com",
    /* home */
    "Home · Blissers": "בית · Blissers", "Good morning": "בוקר טוב", "Good afternoon": "צהריים טובים", "Good evening": "ערב טוב", "Say what you want to do tonight. One swipe books all of it.": "אמרו מה בא לכם הערב. החלקה אחת מזמינה הכול.",
    "Coming up": "בקרוב", "All bookings": "כל ההזמנות", "For you": "בשבילך", "Browse": "עיון", "This week": "השבוע", "All events": "כל האירועים",
    /* explore */
    "Explore · Blissers": "גלה · Blissers", "Search places, offers, events": "חיפוש מקומות, הצעות, אירועים", "Category": "קטגוריה", "Clear filters": "נקה מסננים", "Nothing in this category yet.": "עדיין אין כלום בקטגוריה הזו.",
    "Sort offers": "מיין הצעות", "Most booked": "הכי מוזמן", "Price, low to high": "מחיר, מהנמוך לגבוה", "All places": "כל המקומות", "Nothing matches": "אין התאמות", "Try another word or clear the filters.": "נסו מילה אחרת או נקו את המסננים.",
    "No places match": "אין מקומות מתאימים", "Search offers and places": "חיפוש הצעות ומקומות", "Tel Aviv tonight, from a table to a whole evening. The concierge lives in the mobile app.": "תל אביב הערב, משולחן ועד ערב שלם. הקונסיירז׳ חי באפליקציית המובייל.",
    "No offer here": "אין כאן הצעה",
    /* offer, place */
    "Offer · Blissers": "הצעה · Blissers", "This offer is gone": "ההצעה הזו נעלמה", "It may have been paused by the vendor.": "ייתכן שהספק השהה אותה.", "Back to Explore": "חזרה לגלה",
    "Nothing open that day. Try another date.": "אין משהו פתוח ביום הזה. נסו תאריך אחר.", "Pick a time": "בחרו שעה", "Fewer guests": "פחות אורחים", "More guests": "יותר אורחים",
    "Place · Blissers": "מקום · Blissers", "This place isn’t listed": "המקום הזה לא רשום", "It may have left Blissers or the link is old.": "ייתכן שעזב את Blissers או שהקישור ישן.", "Opens": "פותח", "Closes": "סוגר",
    "From members": "מחברים", "Call": "התקשר", "No reviews": "אין ביקורות", "No reviews yet": "אין ביקורות עדיין", "Price level": "רמת מחיר", "Events here": "אירועים כאן", "Members say": "חברים אומרים",
    "Ask the concierge": "שאל את הקונסיירז׳", "A member": "חבר", "Hours": "שעות", "Contact": "איש קשר", "About": "אודות", "Public page": "עמוד ציבורי", "Payout": "תשלום לספק", "Live offers": "הצעות פעילות",
    "Recent bookings": "הזמנות אחרונות",
    /* concierge */
    "Concierge · Blissers": "קונסיירז׳ · Blissers", "Speak your request": "אמרו את הבקשה בקול", "What do you feel like doing?": "מה בא לכם לעשות?", "Message the concierge": "הודעה לקונסיירז׳", "Send": "שלח",
    "Why these": "למה אלה", "Start a new conversation?": "להתחיל שיחה חדשה?", "The current chat is cleared. Plans you already booked stay in your bookings.": "הצ׳אט הנוכחי נמחק. תוכניות שכבר הזמנתם נשארות בהזמנות.",
    "Start new": "התחל חדש", "Listening…": "מקשיב…", "Heard you. Edit or send.": "שמעתי. ערכו או שלחו.", "Review plan": "סקור תוכנית", "Make it cheaper": "תעשה זול יותר", "Make it quieter": "תעשה שקט יותר",
    "Start over": "התחל מחדש", "Switch": "החלף", "Remember this": "זכור את זה", "Just for now": "רק לעכשיו", "Remember this budget": "זכור את התקציב הזה", "Surprise me": "הפתע אותי",
    "Yes, add it": "כן, תוסיף", "No thanks": "לא תודה", "This weekend": "בסוף השבוע הזה", "Next weekend": "בסוף השבוע הבא",
    "Around ₪500": "בערך ₪500", "Around ₪900": "בערך ₪900", "Up to ₪1,500": "עד ₪1,500", "Around ₪4,000": "בערך ₪4,000", "Around ₪6,000": "בערך ₪6,000", "Up to ₪9,000": "עד ₪9,000",
    "A quiet dinner for two on Saturday": "ארוחת ערב שקטה לשניים בשבת", "Something relaxing tomorrow evening for two, then dinner after": "משהו מרגיע מחר בערב לשניים, ואז ארוחת ערב",
    "A weekend away for two, 2 nights": "סוף שבוע לשניים, 2 לילות", "Saturday daytime on the water for four of us, lunch after": "שבת ביום על המים לארבעה, צהריים אחרי",
    "Tonight, just me, a workshop and a late bar, budget 400": "הערב, רק אני, סדנה ובר מאוחר, תקציב 400", "A quiet candlelit dinner for two on Saturday": "ארוחת ערב שקטה לאור נרות לשניים בשבת",
    "A relaxed evening for two tomorrow, then dinner": "ערב רגוע לשניים מחר, ואז ארוחת ערב",
    "Clean slate. What do you want to do?": "דף חלק. מה בא לכם לעשות?", "Saved to your profile, where you can see it and delete it. I'll weigh it next time too.": "נשמר בפרופיל, שם אפשר לראות ולמחוק. אשקלל את זה גם בפעם הבאה.",
    "Just for now, then. Nothing saved.": "רק לעכשיו, אם כך. לא נשמר דבר.", "Tell me a budget first and I'll keep it.": "קודם תגידו תקציב ואשמור אותו.",
    "Say what you want to do, when, and how many of you. One place, a short evening or a few days away, whichever fits. I'll ask about money only if I need to.": "אמרו מה בא לכם לעשות, מתי, וכמה אתם. מקום אחד, ערב קצר או כמה ימים בחוץ, מה שמתאים. על כסף אשאל רק אם אצטרך.",
    "Roughly what's the budget for the evening, all in?": "בערך מה התקציב לערב, הכול כלול?", "Nothing registered is open for that. Try another day, or tell me one thing you'd like and I'll build around it.": "שום מקום רשום לא פתוח לזה. נסו יום אחר, או אמרו דבר אחד שתרצו ואבנה סביבו.",
    "Pick one above, or tell me what's off.": "בחרו אחד למעלה, או אמרו מה לא מתאים.", "That plan is already booked. Open the booking to change or cancel a stop, or tell me what to plan next.": "התוכנית הזו כבר הוזמנה. פתחו את ההזמנה כדי לשנות או לבטל תחנה, או אמרו מה לתכנן עכשיו.",
    "Switched.": "הוחלף.", "Every stop is already the lightest option in its category. Drop one instead?": "כל תחנה כבר האפשרות הקלה ביותר בקטגוריה שלה. להוריד אחת במקום?",
    "Swapped the priciest stop.": "החלפתי את התחנה היקרה ביותר.", "Kept every stop within a short walk of the last.": "כל תחנה במרחק הליכה קצרה מהקודמת.", "Short taxis between stops, under ten minutes each.": "מוניות קצרות בין התחנות, פחות מעשר דקות כל אחת.",
    "Noted. Open the plan to change it by hand, say what's off, or start over.": "רשמתי. פתחו את התוכנית לשינוי ידני, אמרו מה לא מתאים, או התחילו מחדש.", "Quieter it is. Here's what moved.": "שקט יותר, אם כך. הנה מה שזז.",
    "Here's what moved.": "הנה מה שזז.", "Reworked the plan around that.": "בניתי את התוכנית מחדש סביב זה.", "Dropped it.": "הורדתי.", "Upgrade": "שדרוג", "Your pick": "הבחירה שלך", "Best fit": "ההתאמה הטובה ביותר",
    "Better value": "תמורה טובה יותר", "Also good": "גם טוב", "Special-occasion upgrade": "שדרוג לאירוע מיוחד", "Over your ceiling": "מעל התקרה שלך", "Something": "משהו", "One night": "לילה אחד", "for the two of you": "על שניכם", "Roughly what would you like to spend? A rough number is fine.": "בערך כמה תרצו להוציא? מספר גס מספיק.",
    "A table": "שולחן", "A treatment": "טיפול", "A night out": "ערב בחוץ", "Time on the water": "זמן על המים", "Something cultural": "משהו תרבותי", "A workshop": "סדנה", "A stay": "לינה",
    "a short walk": "הליכה קצרה", "a short taxi": "מונית קצרה", "before the doors": "לפני פתיחת הדלתות", "after the last set": "אחרי הסט האחרון", "a seat": "מקום", "I can also": "אני יכול גם", "I can": "אני יכול",
    "a quiet bar nearby after": "בר שקט בקרבת מקום אחרי", "a table nearby after": "שולחן בקרבת מקום אחרי", "a dinner table near the hotel": "שולחן לארוחת ערב ליד המלון", "dinner before": "ארוחת ערב לפני",
    "dinner by the port after": "ארוחת ערב בנמל אחרי", "dinner before it": "ארוחת ערב לפני", "dinner after": "ארוחת ערב אחרי", "one person": "אדם אחד", "One night": "לילה אחד", "Something": "משהו", "A table": "שולחן", "Roughly what's the budget for the evening, all in?": "בערך מה התקציב לערב, הכול כלול?", "two people": "שני אנשים",
    "quiet tables": "שולחנות שקטים", "candlelit": "לאור נרות", "livelier": "תוסס יותר", "music after 9": "מוזיקה אחרי 9", "made for a date": "נועד לדייט", "sunset light": "אור שקיעה", "on the water": "על המים",
    "sea view": "נוף לים", "good for a group": "טוב לקבוצה", "all yours": "כולו שלכם", "set menu": "תפריט קבוע", "runs late": "נמשך עד מאוחר", "hands-on": "ידיים בחומר", "outdoors": "בחוץ", "pool and garden": "בריכה וגן",
    "vegetarian-friendly": "ידידותי לצמחונים", "the full treatment": "הטיפול המלא", "gets busy": "מתמלא", "slow and calm": "איטי ורגוע", "easy and casual": "קליל ונינוח", "central": "מרכזי",
    "near the top of the budget": "קרוב לקצה התקציב", "close to the cap": "קרוב לתקרה", "a short walk from home": "הליכה קצרה מהבית", "no budget yet": "עדיין אין תקציב", "nothing registered fits better": "שום מקום רשום לא מתאים יותר",
    "louder than you want": "רועש ממה שרציתם", "no loud or crowded places": "בלי מקומות רועשים או צפופים", "quiet places first": "מקומות שקטים קודם", "near the water when possible": "ליד המים כשאפשר",
    "Already in your wallet": "כבר בארנק שלך", "Jaffa flea market stroll": "שיטוט בשוק הפשפשים", "Info only · Not bookable here · free": "מידע בלבד · לא ניתן להזמנה כאן · חינם", "Lunch on the way back": "צהריים בדרך חזרה",
    "Info only · Left open on purpose": "מידע בלבד · הושאר פתוח בכוונה", "Check-out": "צ׳ק-אאוט", "Sunset at Jaffa Port": "שקיעה בנמל יפו", "live quote, re-checked at hold": "הצעת מחיר חיה, נבדקת שוב בהחזקה", "kept": "נשמר",
    "Stays, dining, activities": "לינה, מסעדות, פעילויות", "Before": "לפני", "After": "אחרי", "side by side, hammam first": "זה לצד זה, חמאם קודם", "at your request": "לבקשתכם", "per-person stops repriced": "תחנות לאדם תומחרו מחדש",
    "replaced": "הוחלף", "No budget set yet": "עדיין לא הוגדר תקציב", "Within your usual range": "בטווח הרגיל שלך", "Above your usual range, under your ceiling": "מעל הטווח הרגיל, מתחת לתקרה", "I set": "שקבעתי", "you gave": "שנתתם",
    "cap": "תקרה", "budget": "תקציב", "No budget set": "לא הוגדר תקציב", "budget sheet": "גיליון תקציב",
    "Build an evening around {1} at {2} for two, this weekend": "לבנות ערב סביב {1} ב{2} לשניים, בסוף השבוע הזה", "Plan something around {1} in {2} for two": "לתכנן משהו סביב {1} ב{2} לשניים",
    /* plan */
    "Plan · Blissers": "תוכנית · Blissers", "Review and pay": "סקירה ותשלום", "No plan here": "אין כאן תוכנית", "Ask the concierge for one and it shows up on this screen.": "בקשו אחת מהקונסיירז׳ והיא תופיע במסך הזה.",
    "Open the concierge": "פתח את הקונסיירז׳", "Budget": "תקציב", "Vendors to pay": "ספקים לתשלום", "Charged as": "חיוב כ", "One payment, split by Blissers": "תשלום אחד, מפוצל על ידי Blissers", "Holds": "החזקות",
    "Each vendor holds while you pay": "כל ספק מחזיק בזמן התשלום", "Cancellation": "ביטול", "Full refund up to 24 h before": "החזר מלא עד 24 שעות לפני", "No alternative": "אין חלופה", "This is the only option in its category.": "זו האפשרות היחידה בקטגוריה שלה.",
    "No budget set yet. Tell the concierge a number and it shows here.": "עדיין לא הוגדר תקציב. אמרו מספר לקונסיירז׳ והוא יופיע כאן.", "Kept as it was": "נשאר כפי שהיה", "The concierge keeps the other stops and the time between them.": "הקונסיירז׳ שומר על שאר התחנות והזמן ביניהן.",
    "Drop it": "הורד", "Stop removed": "התחנה הוסרה", "Swap this stop": "החלף תחנה זו", "Swapped": "הוחלף", "Add a stop": "הוסף תחנה", "Stop added": "התחנה נוספה", "Above the cap": "מעל התקרה", "Go ahead": "המשך",
    "hold is": "החזקה", "holds are": "החזקות",
    /* pay */
    "Pay · Blissers": "תשלום · Blissers", "Swipe to pay": "החליקו לתשלום", "Nothing to pay": "אין מה לשלם", "Pick a plan or a ticket first.": "קודם בחרו תוכנית או כרטיס.", "Already paid": "כבר שולם", "This plan became a booking.": "התוכנית הזו הפכה להזמנה.",
    "Open the booking": "פתח את ההזמנה", "Payment method": "אמצעי תשלום", "Pay with": "שלם עם", "Sandbox outcome": "תוצאת סנדבוקס", "Holding with vendors": "מחזיק אצל הספקים", "The price moved": "המחיר זז", "Was": "היה", "Now": "עכשיו",
    "Against the budget": "מול התקציב", "Let the holds go": "שחרר את ההחזקות", "Drop it, keep the rest": "הורד אותו, השאר את השאר", "Let every hold go": "שחרר כל החזקה", "Bank is verifying": "הבנק מאמת",
    "Simulate bank approval": "הדמה אישור בנק", "Keep waiting, view booking": "המשך להמתין, הצג הזמנה", "Confirming with vendors": "מאשר מול הספקים", "Payment didn’t go through": "התשלום לא עבר", "Try again": "נסה שוב",
    "Change payment method": "שנה אמצעי תשלום", "Tickets are yours": "הכרטיסים שלכם", "Show ticket": "הצג כרטיס", "Price changed": "המחיר השתנה", "Hold failed": "ההחזקה נכשלה", "Partial refund": "החזר חלקי",
    "The hold ran out": "ההחזקה פגה", "Pick the tickets again, you get ten minutes to pay.": "בחרו שוב את הכרטיסים, יש לכם עשר דקות לשלם.", "The tickets are yours.": "הכרטיסים שלכם.", "Back to the event": "חזרה לאירוע",
    "View ticket": "הצג כרטיס", "What you’re paying for": "על מה אתם משלמים", "What the vendors do": "מה הספקים עושים", "Bank answer": "תשובת הבנק",
    "Every vendor holds its slot first. The charge happens only once each hold is in, and a stop a vendor can’t honour afterwards is refunded to this method straight away.": "כל ספק מחזיק קודם את המקום. החיוב מתבצע רק אחרי שכל ההחזקות נכנסו, ותחנה שספק לא יכול לכבד אחר כך מוחזרת לאמצעי הזה מיד.",
    "Tickets are final once paid, and go to your wallet instantly.": "כרטיסים סופיים אחרי תשלום ועוברים לארנק מיד.", "Holding…": "מחזיק…", "Paying…": "משלם…", "Holds released, nothing charged": "ההחזקות שוחררו, לא חויב דבר",
    "Swapped. Holding again": "הוחלף. מחזיק שוב", "Dropped. Holding again": "הורד. מחזיק שוב", "Fully booked at that time": "מלא לגמרי בשעה הזו", "Booked, with one change": "הוזמן, עם שינוי אחד", "You’re all set": "הכול מסודר",
    "Keep the rest": "השאר את השאר", "View booking": "הצג הזמנה", "Cancel the rest?": "לבטל את השאר?", "Every confirmed vendor is told and the whole amount goes back to your payment method.": "כל ספק מאושר מעודכן והסכום המלא חוזר לאמצעי התשלום שלך.",
    "Cancel everything": "בטל הכול", "Payment cleared": "התשלום אושר",
    /* booking */
    "Booking · Blissers": "הזמנה · Blissers", "No booking here": "אין כאן הזמנה", "It may have been reset with the demo data.": "ייתכן שאופסה עם נתוני הדמו.", "Adjusted by Blissers": "הותאם על ידי Blissers", "Message support": "הודעה לתמיכה",
    "Move a stop, ask about a refund": "הזיזו תחנה, שאלו על החזר", "The vendor scans or types it. It covers every confirmed stop in this booking.": "הספק סורק או מקליד אותו. הוא מכסה כל תחנה מאושרת בהזמנה הזו.",
    "The vendor scans or types it. It covers every confirmed stop.": "הספק סורק או מקליד אותו. הוא מכסה כל תחנה מאושרת.", "Concierge plan": "תוכנית קונסיירז׳", "Booked directly": "הוזמן ישירות", "your method": "אמצעי התשלום שלך",
    "Inside 24 hours, so no refund was due.": "בתוך 24 שעות, לכן לא הגיע החזר.", "Voucher": "שובר", "Pass": "כרטיס מעבר", "Full refund, more than 24 h away": "החזר מלא, יותר מ-24 שעות קדימה", "Inside 24 h, no refund": "בתוך 24 שעות, אין החזר",
    "Show this at the door": "הציגו את זה בכניסה", "Cancel this booking?": "לבטל את ההזמנה הזו?", "Cancel booking": "בטל הזמנה", "Booked. The vendor has confirmed.": "הוזמן. הספק אישר.",
    "More than 24 hours away, so a full refund.": "יותר מ-24 שעות קדימה, לכן החזר מלא.", "Inside 24 hours, so no refund.": "בתוך 24 שעות, לכן אין החזר.",
    "Bookings · Blissers": "הזמנות · Blissers", "Nothing planned yet": "עדיין לא תוכנן דבר", "Ask the concierge for an evening, or book a place from Explore.": "בקשו ערב מהקונסיירז׳, או הזמינו מקום מגלה.", "Plan something": "תכנן משהו",
    "No past bookings": "אין הזמנות עבר", "Finished bookings land here with a place to rate them.": "הזמנות שהסתיימו מגיעות לכאן עם מקום לדרג אותן.", "Nothing cancelled": "לא בוטל דבר", "Good. Cancelled bookings and their refunds show here.": "יופי. הזמנות שבוטלו וההחזרים שלהן מופיעים כאן.",
    "Book something": "הזמן משהו", "Filter by name or code": "סינון לפי שם או קוד", "Book a place here or ask the concierge in the mobile app.": "הזמינו מקום כאן או בקשו מהקונסיירז׳ באפליקציית המובייל.", "Cancelled bookings and their refunds show here.": "הזמנות שבוטלו וההחזרים שלהן מופיעים כאן.",
    "upcoming booking": "הזמנה קרובה", "upcoming bookings": "הזמנות קרובות", "support thread": "פנייה לתמיכה", "support threads": "פניות לתמיכה", "planned by the concierge": "תוכנן על ידי הקונסיירז׳", "booked direct": "הוזמן ישירות",
    /* events, tickets */
    "Event · Blissers": "אירוע · Blissers", "Hold tickets": "החזק כרטיסים", "This event isn’t listed": "האירוע הזה לא רשום", "It may be over or the link is old.": "ייתכן שהסתיים או שהקישור ישן.", "You’re holding tickets": "אתם מחזיקים כרטיסים",
    "You have tickets": "יש לכם כרטיסים", "This event": "האירוע הזה", "The doors have closed.": "הדלתות נסגרו.", "Every ticket is taken. Join the waitlist and we message you if one frees up.": "כל הכרטיסים נתפסו. הצטרפו לרשימת ההמתנה ונעדכן אם יתפנה אחד.",
    "Nearly full. Held tickets are kept for ten minutes.": "כמעט מלא. כרטיסים מוחזקים נשמרים עשר דקות.", "Fewer tickets": "פחות כרטיסים", "More tickets": "יותר כרטיסים", "free ticket": "כרטיס חינם", "free tickets": "כרטיסי חינם",
    "We’ll message you if a ticket frees up": "נעדכן אם יתפנה כרטיס", "Events · Blissers": "אירועים · Blissers", "My tickets": "הכרטיסים שלי", "No events on sale": "אין אירועים במכירה", "New nights are added through the week.": "ערבים חדשים נוספים במהלך השבוע.",
    "No tickets yet": "אין כרטיסים עדיין", "Hold a ticket for ten minutes, pay, and it lives here.": "החזיקו כרטיס עשר דקות, שלמו, והוא יחיה כאן.", "Browse events": "עיון באירועים", "Ticket · Blissers": "כרטיס · Blissers", "No ticket here": "אין כאן כרטיס",
    "Held for you. Pay before the clock runs out or the tickets go back on sale.": "מוחזק בשבילכם. שלמו לפני שהשעון נגמר או שהכרטיסים יחזרו למכירה.", "Release the hold": "שחרר את ההחזקה", "Add to Apple Wallet": "הוסף ל-Apple Wallet", "Share with friends": "שתף עם חברים",
    "Send the code to the others": "שלחו את הקוד לאחרים", "Event details": "פרטי האירוע", "These tickets went back on sale. Pick again and you get ten more minutes.": "הכרטיסים האלה חזרו למכירה. בחרו שוב ותקבלו עוד עשר דקות.", "Release the hold?": "לשחרר את ההחזקה?",
    "The tickets go back on sale straight away.": "הכרטיסים חוזרים למכירה מיד.", "Release": "שחרר", "Hold released": "ההחזקה שוחררה", "Added to Apple Wallet": "נוסף ל-Apple Wallet", "Copied, paste it to your friends": "הועתק, הדביקו לחברים",
    "A ticket": "כרטיס", "This one has passed": "זה כבר עבר", "Held for 10 minutes while you pay. Nothing is charged yet.": "מוחזק 10 דקות בזמן התשלום. עדיין לא חויב דבר.", "Free tickets are yours straight away.": "כרטיסי חינם שלכם מיד.",
    "You are on the waitlist": "אתם ברשימת ההמתנה", "Could not hold those seats": "לא ניתן להחזיק את המקומות האלה", "Hold a seat at any event and it shows here.": "החזיקו מקום בכל אירוע והוא יופיע כאן.", "See events": "הצג אירועים",
    "Nothing scheduled": "אין כלום בלו״ז", "New events are added every week.": "אירועים חדשים נוספים כל שבוע.", "The bank declined. Try another method.": "הבנק דחה. נסו אמצעי אחר.", "Paid. Waiting for the vendor…": "שולם. ממתין לספק…",
    "Paid. Enjoy the show": "שולם. תיהנו מההופעה", "Release these seats?": "לשחרר את המקומות האלה?", "They go straight back on sale.": "הם חוזרים ישר למכירה.", "Copied to share": "הועתק לשיתוף", "Saved to Downloads": "נשמר בהורדות",
    "On the waitlist": "ברשימת ההמתנה", "Doors": "דלתות", "Ticket price": "מחיר כרטיס", "Tickets sold": "כרטיסים נמכרו",
    /* feedback, support */
    "Feedback · Blissers": "משוב · Blissers", "Every rating earns 50 points": "כל דירוג מזכה ב-50 נקודות", "Your ratings": "הדירוגים שלך", "Not good": "לא טוב", "Could be better": "יכול להיות טוב יותר", "Fine": "בסדר", "Really good": "ממש טוב",
    "Perfect evening": "ערב מושלם", "The food, the timing between stops, the welcome at the door…": "האוכל, התזמון בין התחנות, קבלת הפנים בכניסה…", "Thanks. 50 points added": "תודה. נוספו 50 נקודות", "Rate a booking": "דרג הזמנה",
    "Earn 50 points per review": "50 נקודות על כל ביקורת", "Write to support": "כתבו לתמיכה", "Support chat · Blissers": "צ׳אט תמיכה · Blissers", "No conversation here": "אין כאן שיחה",
    "Send a first message and you can hand the thread to a person or mark it resolved.": "שלחו הודעה ראשונה ותוכלו להעביר את הפנייה לאדם או לסמן כנפתרה.", "Messages": "הודעות", "New request": "פנייה חדשה", "A booking, a refund, anything": "הזמנה, החזר, כל דבר",
    "Dana from Blissers is on this": "דנה מ-Blissers מטפלת בזה", "Resolved. Write again to reopen.": "נפתר. כתבו שוב כדי לפתוח מחדש.", "The concierge answers in seconds": "הקונסיירז׳ עונה תוך שניות", "Talk to a person": "דברו עם אדם",
    "Dana has the thread": "הפנייה אצל דנה", "Mark resolved": "סמן כנפתר", "Marked resolved": "סומן כנפתר", "Support · Blissers": "תמיכה · Blissers", "Your requests": "הפניות שלך", "Common questions": "שאלות נפוצות",
    "50 points for every rating": "50 נקודות על כל דירוג", "Call us": "התקשרו אלינו", "03-555-0100, every day 09:00–23:00": "03-555-0100, כל יום 09:00–23:00", "How refunds work": "איך עובדים החזרים",
    "A stop a vendor can’t honour is refunded to your payment method the moment they decline. Cancelling more than 24 hours before the first stop refunds everything. Inside 24 hours nothing is refunded, but support can ask the vendor.": "תחנה שספק לא יכול לכבד מוחזרת לאמצעי התשלום ברגע הדחייה. ביטול יותר מ-24 שעות לפני התחנה הראשונה מחזיר הכול. בתוך 24 שעות אין החזר, אבל התמיכה יכולה לבקש מהספק.",
    "Moving a booking": "הזזת הזמנה", "Message support from the booking. The concierge asks the vendor for the new time and shifts the stops after it if you want.": "שלחו הודעה לתמיכה מההזמנה. הקונסיירז׳ מבקש מהספק את השעה החדשה ומזיז את התחנות שאחריה אם תרצו.",
    "Where my code is": "איפה הקוד שלי", "Every booking has one code, shown from the booking screen. Vendors scan or type it at the door. Tickets have their own code on the ticket.": "לכל הזמנה קוד אחד, מוצג ממסך ההזמנה. ספקים סורקים או מקלידים אותו בכניסה. לכרטיסים קוד משלהם על הכרטיס.",
    "Points and the wallet": "נקודות והארנק", "Every ₪100 you spend earns a point. Rating a booking earns 50. Ten points are worth ₪1 on your next plan. The wallet is topped up from a card and can pay for anything.": "כל ₪100 שמוציאים מזכים בנקודה. דירוג הזמנה מזכה ב-50. עשר נקודות שוות ₪1 בתוכנית הבאה. הארנק נטען מכרטיס ויכול לשלם על הכול.",
    "Still need help": "עדיין צריכים עזרה", "Dana here, I've seen your message and will get back to you within the hour.": "דנה כאן, ראיתי את ההודעה ואחזור אליכם תוך שעה.",
    "I've checked the payment: nothing is stuck on our side. Want me to bring in a colleague to confirm with the bank?": "בדקתי את התשלום: שום דבר לא תקוע אצלנו. לצרף קולגה שיאשר מול הבנק?",
    "I can ask the vendor to move it. Which time works, and should I shift the stops after it too?": "אני יכול לבקש מהספק להזיז. איזו שעה מתאימה, ולהזיז גם את התחנות שאחריה?",
    "You can cancel from the booking screen. More than 24 hours before the first stop, the refund is in full.": "אפשר לבטל ממסך ההזמנה. יותר מ-24 שעות לפני התחנה הראשונה, ההחזר מלא.",
    "Got it. I'll sort that with the vendor and confirm here in a few minutes.": "הבנתי. אסדר את זה מול הספק ואאשר כאן תוך כמה דקות.", "Hi, Dana from Blissers. I've read the thread and I'm on it. You'll hear from me here.": "היי, דנה מ-Blissers. קראתי את הפנייה ואני על זה. תשמעו ממני כאן.",
    /* profile */
    "Profile · Blissers": "פרופיל · Blissers", "Membership": "חברות", "Auto-renew": "חידוש אוטומטי", "Preferences": "העדפות", "Remembered by the concierge": "הקונסיירז׳ זוכר", "Notifications": "התראות", "Push": "פוש", "WhatsApp": "וואטסאפ",
    "Chat with the concierge or a person": "צ׳אט עם הקונסיירז׳ או עם אדם", "not verified": "לא מאומת", "Auto-renew on": "חידוש אוטומטי פועל", "Auto-renew off": "חידוש אוטומטי כבוי", "Edit profile": "ערוך פרופיל", "Profile saved": "הפרופיל נשמר",
    "Choose a plan": "בחרו מסלול", "Keep current plan": "השאר מסלול נוכחי", "Forgotten. The concierge will ask again": "נשכח. הקונסיירז׳ ישאל שוב", "Concierge with a daily limit": "קונסיירז׳ עם מגבלה יומית", "Unlimited concierge, priority holds": "קונסיירז׳ ללא הגבלה, החזקות בעדיפות",
    "Everything, plus a human planner on call": "הכול, ועוד מתכנן אנושי זמין", "No monthly fee": "ללא דמי מנוי", "Wallet and points": "ארנק ונקודות", "Interests": "תחומי עניין", "Location": "מיקום",
    /* wallet */
    "Wallet · Blissers": "ארנק · Blissers", "Payment methods": "אמצעי תשלום", "Add card": "הוסף כרטיס", "Set up on this iPhone": "מוגדר באייפון הזה", "Balance after:": "יתרה אחרי:", "MM/YY": "MM/YY", "Card number": "מספר כרטיס",
    "Enter the 16 digits on the front.": "הזינו את 16 הספרות שבחזית.", "Expires": "תוקף", "CVC": "CVC", "Demo only. Nothing is sent anywhere.": "דמו בלבד. שום דבר לא נשלח לשום מקום.",
    "Ready on this iPhone. Pick it on the payment screen and confirm with Face ID.": "מוכן באייפון הזה. בחרו אותו במסך התשלום ואשרו עם Face ID.", "Used for": "משמש ל", "Bookings, tickets, top-ups": "הזמנות, כרטיסים, טעינות",
    "Top up the wallet": "טען את הארנק", "Add money": "הוסף כסף", "Add a card": "הוסף כרטיס", "Save card": "שמור כרטיס", "Card added": "הכרטיס נוסף", "Make default": "הגדר כברירת מחדל", "Default card changed": "כרטיס ברירת המחדל שונה",
    "Bookings already paid with it are not affected.": "הזמנות שכבר שולמו איתו לא מושפעות.", "Card removed": "הכרטיס הוסר", "Filter activity": "סנן פעילות", "Top up from a card, pay for anything, earn points on every plan.": "טענו מכרטיס, שלמו על הכול, צברו נקודות על כל תוכנית.",
    "Paid through Blissers": "שולם דרך Blissers", "Available in the mobile app": "זמין באפליקציית המובייל", "Renews": "מתחדש", "No activity yet": "אין פעילות עדיין", "Top-ups, payments and refunds show here.": "טעינות, תשלומים והחזרים מופיעים כאן.",
    "₪50 to ₪5,000.": "₪50 עד ₪5,000.",
    /* vendor portal */
    "Dashboard · Blissers": "לוח בקרה · Blissers", "Redeem a code": "ממש קוד", "Awaiting your answer": "ממתין לתשובתך", "Guests today": "אורחים היום", "Last 30 days": "30 הימים האחרונים", "Your events": "האירועים שלך", "Shortcuts": "קיצורים",
    "Open or close a slot": "פתח או סגור משבצת", "Edit your offers": "ערוך את ההצעות שלך", "See your public page": "הצג את העמוד הציבורי שלך", "Blissers is reviewing your application. Offers go live the moment it is approved.": "Blissers בודקת את הבקשה שלך. ההצעות עולות לאוויר ברגע האישור.",
    "Decline this request?": "לדחות את הבקשה הזו?", "Your share": "החלק שלך", "Your bookings": "ההזמנות שלך", "Decline": "דחה", "At the door": "בכניסה", "Message the concierge": "הודעה לקונסיירז׳",
    "Guests show one code for the whole plan. Redeem it when they arrive and the stop is marked done.": "האורחים מציגים קוד אחד לכל התוכנית. ממשו אותו בהגעה והתחנה תסומן כבוצעה.",
    "The guest is refunded for this stop straight away and offered somewhere else instead.": "האורח מקבל החזר על התחנה הזו מיד ומוצע לו מקום אחר במקום.", "No availability at that time": "אין זמינות בשעה הזו", "Fully booked for a private event": "מלא לגמרי לאירוע פרטי",
    "Closed that day": "סגור ביום הזה", "Group too large": "קבוצה גדולה מדי", "A note about this booking…": "הערה על ההזמנה הזו…", "Sent by the concierge": "נשלח על ידי הקונסיירז׳", "Confirmed. The guest has been told.": "אושר. האורח עודכן.",
    "Decline this stop?": "לדחות את התחנה הזו?", "Decline and refund": "דחה והחזר", "Declined. The guest is refunded.": "נדחה. האורח קיבל החזר.", "Sent to the concierge team": "נשלח לצוות הקונסיירז׳", "Needs answer": "דורש תשובה",
    "Filter by guest or code": "סינון לפי אורח או קוד", "Show everything": "הצג הכול", "Nothing waiting": "אין ממתינים", "Every request has an answer.": "לכל בקשה יש תשובה.", "No upcoming guests": "אין אורחים קרובים",
    "Confirmed and pending bookings for the days ahead show here.": "הזמנות מאושרות וממתינות לימים הקרובים מופיעות כאן.", "Redeemed and finished bookings show here.": "הזמנות שמומשו והסתיימו מופיעות כאן.",
    "Bookings from the concierge and direct bookings land here.": "הזמנות מהקונסיירז׳ והזמנות ישירות מגיעות לכאן.", "Not one of yours": "לא אחת משלך", "Availability · Blissers": "זמינות · Blissers", "Add a slot": "הוסף משבצת", "How slots work": "איך משבצות עובדות",
    "Seats booked through Blissers count down automatically.": "מקומות שהוזמנו דרך Blissers נספרים אוטומטית.", "Click a slot to close or reopen it.": "לחצו על משבצת כדי לסגור או לפתוח מחדש.", "Members cannot book this day until you add one.": "חברים לא יכולים להזמין ביום הזה עד שתוסיפו אחת.",
    "1 to 60 seats.": "1 עד 60 מקומות.", "A slot is one sitting. Add one per time you can take guests.": "משבצת היא סבב אחד. הוסיפו אחת לכל שעה שבה אפשר לקבל אורחים.", "open slot": "משבצת פתוחה", "open slots": "משבצות פתוחות", "Open slots": "משבצות פתוחות",
    "Seats booked": "מקומות הוזמנו", "Fill rate": "אחוז תפוסה", "Add slot": "הוסף משבצת", "There is already a slot at that time.": "כבר יש משבצת בשעה הזו.", "Offers · Blissers": "הצעות · Blissers", "Filter offers": "סנן הצעות", "No offers here": "אין כאן הצעות",
    "An offer is something the concierge can book: a table, a treatment, a sail.": "הצעה היא משהו שהקונסיירז׳ יכול להזמין: שולחן, טיפול, שייט.", "Give the offer a name.": "תנו להצעה שם.", "A price of ₪0 or more.": "מחיר של ₪0 ומעלה.", "Length, minutes": "משך, דקות",
    "0 for an add-on with no set length.": "0 לתוספת ללא משך קבוע.", "Evening, Date night": "ערב, דייט", "Comma-separated. Members see them on the card.": "מופרדות בפסיקים. חברים רואים אותן על הכרטיס.", "No set length": "ללא משך קבוע", "Edit offer": "ערוך הצעה", "Offer saved": "ההצעה נשמרה",
    "New offer": "הצעה חדשה", "Create offer": "צור הצעה", "Offer created": "ההצעה נוצרה", "Duplicated as a draft": "שוכפל כטיוטה", "Redemption · Blissers": "מימוש · Blissers", "Redeem a booking": "ממש הזמנה",
    "Type or scan the code the guest shows. Each stop redeems once.": "הקלידו או סרקו את הקוד שהאורח מציג. כל תחנה ממומשת פעם אחת.", "Booking code": "קוד הזמנה", "Codes look like BLS-7F3K.": "קודים נראים כמו BLS-7F3K.", "Redeem": "ממש",
    "Redeemed recently": "מומש לאחרונה", "Guests in today": "אורחים שנכנסו היום", "Still expected today": "עדיין צפויים היום", "Nothing redeemed yet": "עדיין לא מומש דבר", "The first code you redeem lands here.": "הקוד הראשון שתממשו יופיע כאן.",
    "Check-in · Blissers": "צ׳ק-אין · Blissers", "Door check-in": "צ׳ק-אין בכניסה", "Type or scan the code on a ticket. Each code checks in once.": "הקלידו או סרקו את הקוד שעל הכרטיס. כל קוד נכנס פעם אחת.", "Ticket code": "קוד כרטיס",
    "Codes look like TK-7F3A.": "קודים נראים כמו TK-7F3A.", "Check in": "הכנס", "Checked in tonight": "נכנסו הערב", "No events scheduled": "אין אירועים בלו״ז", "Nobody in yet": "עדיין אף אחד לא נכנס", "Doors open, the first code lands here.": "הדלתות פתוחות, הקוד הראשון יופיע כאן.",
    "That code does not match a ticket.": "הקוד הזה לא תואם לכרטיס.", "No event here": "אין כאן אירוע", "Vendor closed early": "הספק סגר מוקדם",
    /* admin */
    "Back office · Blissers": "משרד אחורי · Blissers", "Taken through Blissers": "נגבה דרך Blissers", "Live bookings": "הזמנות חיות", "Vendors awaiting review": "ספקים ממתינים לבדיקה", "Open support threads": "פניות תמיכה פתוחות", "Needs attention": "דורש טיפול",
    "Latest bookings": "הזמנות אחרונות", "Inbox": "תיבת דואר", "No bookings yet": "אין הזמנות עדיין", "Every plan a member pays for appears here.": "כל תוכנית שחבר משלם עליה מופיעה כאן.", "Reply": "השב",
    "No such booking": "אין הזמנה כזו", "Confirm for vendor": "אשר במקום הספק", "Remove and refund": "הסר והחזר", "0 or more.": "0 ומעלה.", "Not in the past.": "לא בעבר.",
    "The member sees the new price and time on their plan. A lower price is refunded to their card when the vendor confirms.": "החבר רואה את המחיר והשעה החדשים בתוכנית שלו. מחיר נמוך יותר מוחזר לכרטיס כשהספק מאשר.", "Reason the member sees": "הסיבה שהחבר רואה",
    "Vendor could not honour the slot": "הספק לא יכול היה לכבד את המשבצת", "Member asked for a change": "החבר ביקש שינוי", "Venue closed that day": "המקום סגור ביום הזה", "Duplicate stop": "תחנה כפולה",
    "Confirmed on the vendor’s behalf": "אושר בשם הספק", "Stop updated": "התחנה עודכנה", "Add stop": "הוסף תחנה", "Stop added, vendor asked to confirm": "התחנה נוספה, הספק התבקש לאשר",
    "Every stop is cancelled and the member is refunded what the policy allows. Vendors are told.": "כל תחנה מבוטלת והחבר מקבל החזר כפי שהמדיניות מאפשרת. הספקים מעודכנים.", "Every status": "כל סטטוס", "Any source": "כל מקור", "Booked direct": "הוזמן ישירות",
    "Any date": "כל תאריך", "Code, member or vendor": "קוד, חבר או ספק", "Filter bookings": "סנן הזמנות", "No bookings match": "אין הזמנות מתאימות", "Clear a filter to see the rest.": "נקו מסנן כדי לראות את השאר.", "Catalogue section": "חלק בקטלוג",
    "Catalogue · Blissers": "קטלוג · Blissers", "Title or vendor": "כותרת או ספק", "Filter the catalogue": "סנן את הקטלוג", "Every vendor": "כל ספק", "No offers match": "אין הצעות מתאימות", "Clear a filter, or add the offer yourself.": "נקו מסנן, או הוסיפו את ההצעה בעצמכם.",
    "No events match": "אין אירועים מתאימים", "Clear a filter, or put a night on sale.": "נקו מסנן, או העלו ערב למכירה.", "New event": "אירוע חדש", "live offer": "הצעה פעילה", "live offers": "הצעות פעילות", "No such event": "אין אירוע כזה",
    "Give the event a title.": "תנו לאירוע כותרת.", "Host vendor": "ספק מארח", "Where is it?": "איפה זה?", "Pick a date.": "בחרו תאריך.", "Pick a time.": "בחרו שעה.", "Sold out keeps the page up but stops sales.": "״אזל״ משאיר את העמוד אבל עוצר מכירות.",
    "Sales appear here as members buy in.": "המכירות מופיעות כאן כשחברים קונים.", "A ticketed night members can buy into": "ערב עם כרטיסים שחברים יכולים לקנות", "Put on sale": "העלה למכירה", "Save changes": "שמור שינויים", "Event is on sale": "האירוע במכירה",
    "No such offer": "אין הצעה כזו", "Give the offer a title.": "תנו להצעה כותרת.", "A price of 0 or more.": "מחיר של 0 ומעלה.", "Length in minutes": "משך בדקות", "At least 15 minutes.": "לפחות 15 דקות.", "date night, tasting, vegetarian": "דייט, טעימות, צמחוני",
    "Only active offers go into plans.": "רק הצעות פעילות נכנסות לתוכניות.", "Comma separated. The concierge matches a request on these.": "מופרדות בפסיקים. הקונסיירז׳ מתאים בקשה לפיהן.", "Never booked": "מעולם לא הוזמן", "No plan has included this offer yet.": "אף תוכנית עדיין לא כללה את ההצעה הזו.",
    "Something the concierge can put in a plan": "משהו שהקונסיירז׳ יכול לשים בתוכנית", "Payment · Blissers": "תשלום · Blissers", "No such payment": "אין תשלום כזה", "All payments": "כל התשלומים",
    "Up to {3}. A full refund cancels every stop not yet redeemed.": "עד {3}. החזר מלא מבטל כל תחנה שטרם מומשה.", "Between ₪1 and {4}.": "בין ₪1 ל-{4}.", "The member is asked to pay again and the vendors hear nothing until they do.": "החבר מתבקש לשלם שוב והספקים לא שומעים דבר עד אז.",
    "event tickets": "כרטיסי אירוע", "a booking": "הזמנה", "Nothing left to refund.": "לא נותר מה להחזיר.", "Mark as settled?": "לסמן כמסולק?", "Settle": "סלק", "Settled": "סולק", "Mark as failed?": "לסמן כנכשל?", "Mark as failed": "סמן כנכשל", "Marked as failed": "סומן כנכשל",
    "Retry the charge?": "לנסות את החיוב שוב?", "Retry": "נסה שוב", "Charge sent again, pending at the bank": "החיוב נשלח שוב, ממתין לבנק", "Payments · Blissers": "תשלומים · Blissers", "Bookings and tickets": "הזמנות וכרטיסים", "Any method": "כל אמצעי",
    "Payment, booking code or member": "תשלום, קוד הזמנה או חבר", "Filter payments": "סנן תשלומים", "No payments match": "אין תשלומים מתאימים", "Reports · Blissers": "דוחות · Blissers", "Download CSV": "הורד CSV", "Booked value": "שווי הזמנות",
    "Commission earned": "עמלה שהורווחה", "Average booking": "הזמנה ממוצעת", "By category": "לפי קטגוריה", "Top vendors": "ספקים מובילים", "All vendors": "כל הספקים", "Vendor payouts": "תשלומים לספקים", "At a glance": "במבט חטוף",
    "Planned by the concierge": "תוכנן על ידי הקונסיירז׳", "Multi-vendor plans": "תוכניות רב-ספקיות", "Ticket sales": "מכירת כרטיסים", "Active members": "חברים פעילים", "Live vendors": "ספקים פעילים", "Refund rate": "שיעור החזרים", "No payouts due": "אין תשלומים לספקים",
    "Nothing has been booked with any vendor.": "לא הוזמן דבר אצל אף ספק.", "Commission": "עמלה", "Owed to vendor": "חוב לספק", "Commission %": "עמלה %", "Owed": "חוב", "CSV downloaded": "ה-CSV הורד",
    "User · Blissers": "משתמש · Blissers", "No such user": "אין משתמש כזה", "All users": "כל המשתמשים", "Event tickets": "כרטיסי אירועים", "Support threads": "פניות תמיכה", "Plans they pay for appear here.": "תוכניות שהם משלמים עליהן מופיעות כאן.",
    "A name is needed.": "צריך שם.", "Enter an email address.": "הזינו כתובת אימייל.", "They are signed out everywhere and cannot book until you reactivate them. Live bookings stay as they are.": "הם מנותקים בכל מקום ולא יכולים להזמין עד שתפעילו אותם מחדש. הזמנות חיות נשארות כפי שהן.",
    "User": "משתמש", "Vendor account": "חשבון ספק", "Vendor accounts": "חשבונות ספק", "Edit user": "ערוך משתמש", "Keep active": "השאר פעיל", "Suspend": "השעה", "They can sign in and book again straight away.": "הם יכולים להיכנס ולהזמין שוב מיד.",
    "Reactivate": "הפעל מחדש", "Reactivated": "הופעל מחדש", "Users · Blissers": "משתמשים · Blissers", "Invite someone": "הזמן מישהו", "Every role": "כל תפקיד", "Members": "חברים", "Admins": "מנהלים", "Name, email or phone": "שם, אימייל או טלפון",
    "Filter users": "סנן משתמשים", "No one matches": "אף אחד לא מתאים", "Try a different name, or clear the filters.": "נסו שם אחר, או נקו את המסננים.", "active member": "חבר פעיל", "active members": "חברים פעילים", "Send invite": "שלח הזמנה", "Invite sent": "ההזמנה נשלחה",
    "Vendor · Blissers": "ספק · Blissers", "No such vendor": "אין ספק כזה", "No offers": "אין הצעות", "The concierge cannot book a vendor without one.": "הקונסיירז׳ לא יכול להזמין ספק בלי אחת.", "No events": "אין אירועים", "Ticketed nights for this vendor appear here.": "ערבים עם כרטיסים של הספק הזה מופיעים כאן.",
    "0 to 50.": "0 עד 50.", "Contact name": "שם איש קשר", "Contact phone": "טלפון איש קשר", "Contact email": "אימייל איש קשר", "draft offer": "הצעת טיוטה", "draft offers": "הצעות טיוטה", "The listing goes live and the concierge can book it from now on.": "הרישום עולה לאוויר והקונסיירז׳ יכול להזמין אותו מעכשיו.",
    "Approve": "אשר", "Approved. The listing is live.": "אושר. הרישום באוויר.", "Members stop seeing the listing at once. Confirmed bookings stay in place.": "חברים מפסיקים לראות את הרישום מיד. הזמנות מאושרות נשארות.", "The vendor is told the application was not accepted. You can reactivate them later.": "הספק מעודכן שהבקשה לא התקבלה. אפשר להפעיל אותו מחדש מאוחר יותר.",
    "Reject": "דחה", "Rejected": "נדחה", "The listing is visible and bookable again.": "הרישום גלוי וניתן להזמנה שוב.", "Listing is live again": "הרישום שוב באוויר", "Edit vendor": "ערוך ספק", "Vendors · Blissers": "ספקים · Blissers", "Add a vendor": "הוסף ספק",
    "Name or area": "שם או אזור", "Filter vendors": "סנן ספקים", "Every category": "כל קטגוריה", "No vendors match": "אין ספקים מתאימים", "Clear a filter, or add the vendor yourself.": "נקו מסנן, או הוסיפו את הספק בעצמכם.",
    "The vendor starts as awaiting review. Approve them from their page once the details are checked.": "הספק מתחיל כממתין לבדיקה. אשרו אותו מהעמוד שלו אחרי בדיקת הפרטים.", "live vendor": "ספק פעיל", "live vendors": "ספקים פעילים", "Add vendor": "הוסף ספק", "Vendor added": "הספק נוסף",
    "Nothing here": "אין כאן כלום", "Table slot held": "משבצת שולחן מוחזקת", "No deposit": "ללא פיקדון", "Reminder the day before": "תזכורת יום לפני", "Free cancellation until 24 h before": "ביטול חינם עד 24 שעות לפני", "Treatment slot held": "משבצת טיפול מוחזקת",
    "Pay now or at the venue": "שלם עכשיו או במקום", "Rate held, re-quoted at payment": "המחיר מוחזק, מתומחר מחדש בתשלום", "Charged through the payment provider": "חיוב דרך ספק התשלומים", "Voucher in your wallet": "שובר בארנק שלך", "Per the hotel, free until 48 h before": "לפי המלון, חינם עד 48 שעות לפני",
    "Entry held for 10 minutes": "כניסה מוחזקת 10 דקות", "Pay now": "שלם עכשיו", "QR pass in your wallet": "כרטיס QR בארנק שלך", "Non-refundable on the day": "ללא החזר ביום האירוע", "Seats held for 10 minutes": "מקומות מוחזקים 10 דקות",
    "Weather cancellations refunded in full": "ביטולי מזג אוויר מוחזרים במלואם", "Seat held": "מקום מוחזק", "Free cancellation until 48 h before": "ביטול חינם עד 48 שעות לפני", "Deposit now, the rest at the table": "פיקדון עכשיו, השאר בשולחן",
    "No availability": "אין זמינות", "No booking carries that code.": "אף הזמנה לא נושאת את הקוד הזה.", "Removed by Blissers": "הוסר על ידי Blissers", "no reason given": "לא ניתנה סיבה", "The hold has expired.": "ההחזקה פגה.", "No ticket carries that code.": "אף כרטיס לא נושא את הקוד הזה.",
    "reviews": "ביקורות", "review": "ביקורת", "points": "נקודות", "guests": "אורחים", "guest": "אורח", "stops": "תחנות", "stop": "תחנה", "nights": "לילות", "night": "לילה", "tickets": "כרטיסים", "ticket": "כרטיס", "min": "דק׳", "km": "ק״מ", "pts": "נק׳",
    "days": "ימים", "day": "יום", "h": "שע׳", "seats": "מקומות", "seat": "מקום", "offers": "הצעות", "offer": "הצעה", "events": "אירועים", "event": "אירוע", "bookings": "הזמנות", "booking": "הזמנה", "members": "חברים", "member": "חבר",
    "vendors": "ספקים", "vendor": "ספק", "users": "משתמשים", "user": "משתמש", "payments": "תשלומים", "payment": "תשלום", "plans": "תוכניות", "plan": "תוכנית", "slots": "משבצות", "slot": "משבצת", "people": "אנשים", "sold": "נמכרו", "left": "נותרו",
    "all": "הכול", "net": "נטו", "free": "חינם", "applied": "הגיש בקשה", "invited": "הוזמנו", "over": "מעל", "less": "פחות", "more": "יותר", "each": "כל אחד", "earlier": "מוקדם יותר", "later": "מאוחר יותר", "tonight": "הערב", "tomorrow": "מחר", "today": "היום",
    "on sale": "במכירה", "in the wallet": "בארנק", "in your wallet": "בארנק שלך", "nothing charged yet": "עדיין לא חויב דבר", "unspent": "לא נוצל", "moved": "הוזז", "from": "מ", "to": "ל", "at": "ב", "of": "מתוך", "for": "עבור", "and": "ו", "then": "ואז",
    "Mon": "ב׳", "Tue": "ג׳", "Wed": "ד׳", "Thu": "ה׳", "Fri": "ו׳", "Sat": "שבת", "Sun": "א׳", "Monday": "יום שני", "Tuesday": "יום שלישי", "Wednesday": "יום רביעי", "Friday": "יום שישי", "Saturday": "שבת", "Sunday": "יום ראשון",
    "Jan": "ינו׳", "Feb": "פבר׳", "Mar": "מרץ", "Apr": "אפר׳", "May": "מאי", "Jun": "יוני", "Jul": "יולי", "Aug": "אוג׳", "Sep": "ספט׳", "Sept": "ספט׳", "Oct": "אוק׳", "Nov": "נוב׳", "Dec": "דצמ׳",
    "January": "ינואר", "February": "פברואר", "March": "מרץ", "April": "אפריל", "June": "יוני", "July": "יולי", "August": "אוגוסט", "September": "ספטמבר", "October": "אוקטובר", "November": "נובמבר", "December": "דצמבר",
    "daytime": "ביום", "evening": "בערב",
  };

  /* the concierge's reason fragments and trait words, which app.js composes with commas and "and" */
  Object.assign(DICT, {
    "quiet tables": "שולחנות שקטים", "candlelit": "לאור נרות", "livelier": "תוסס יותר", "music after 9": "מוזיקה אחרי 9", "made for a date": "עשוי לדייט", "sunset light": "אור שקיעה", "on the water": "על המים", "sea view": "נוף לים",
    "good for a group": "טוב לקבוצה", "all yours": "כולו שלכם", "set menu": "תפריט קבוע", "runs late": "נמשך עד מאוחר", "hands-on": "מעשי", "outdoors": "בחוץ", "pool and garden": "בריכה וגינה", "vegetarian-friendly": "ידידותי לצמחונים",
    "the full treatment": "הטיפול המלא", "gets busy": "מתמלא", "slow and calm": "איטי ורגוע", "easy and casual": "קליל ולא רשמי", "central": "מרכזי",
    "a short walk from home": "הליכה קצרה מהבית", "a short walk": "הליכה קצרה", "a short taxi": "נסיעת מונית קצרה", "before the doors": "לפני פתיחת הדלתות", "after the last set": "אחרי הסט האחרון", "a seat": "מקום",
    "newly added; reviewed by our team": "חדש; נבדק על ידי הצוות שלנו", "near the top of the budget": "קרוב לקצה התקציב", "close to the cap": "קרוב לתקרה", "louder than you want": "רועש יותר ממה שרציתם",
    "nothing registered fits better": "שום מקום רשום לא מתאים יותר", "unchanged": "ללא שינוי", "at your request": "לבקשתכם", "per-person stops repriced": "תחנות לאדם תומחרו מחדש", "replaced": "הוחלף", "side by side, hammam first": "זה לצד זה, חמאם קודם",
    "one person": "אדם אחד", "two people": "שני אנשים", "no budget yet": "עדיין אין תקציב", "home": "הבית", "Quiet tables": "שולחנות שקטים",
  });

  /* strings a page-by-page audit in Hebrew still found in English (7 Oct 2026) */
  Object.assign(DICT, {
    "Switch language": "החלפת שפה", "Language": "שפה",
    "How was it?": "איך היה?", "What stood out?": "מה בלט?", "Send feedback": "שליחת משוב", "Nothing to rate": "אין מה לדרג",
    "Finished bookings you haven’t rated show here.": "הזמנות שהסתיימו ועוד לא דירגתם מופיעות כאן.", "Past bookings": "הזמנות קודמות", "of 5": "מתוך 5",
    "Add to a concierge plan": "הוספה לתוכנית הקונסיירז׳", "Build an evening around it": "לבנות סביבו ערב", "Start a plan": "התחל תוכנית", "Join the waitlist": "הצטרפו לרשימת ההמתנה",
    "We tell you first if seats free up.": "נודיע לכם ראשונים אם יתפנו מקומות.", "No events coming up": "אין אירועים קרובים", "Runs": "מתקיים", "Show code at the door": "הציגו את הקוד בכניסה", "Show code": "הצג קוד",
    "One code for every stop": "קוד אחד לכל התחנות", "Charged now. The vendor confirms within minutes. Full refund until 24 hours before.": "החיוב מתבצע עכשיו. הספק מאשר תוך דקות. החזר מלא עד 24 שעות לפני.",
    "Tickets on hold,": "כרטיסים שמורים,", "left to pay": "נותרו לתשלום", "Retry the charge": "נסו לחייב שוב", "What happens next": "מה קורה עכשיו", "Available instead": "זמין במקום",
    "No ratings yet": "עדיין אין דירוגים", "Your ratings show here and on each place.": "הדירוגים שלכם מופיעים כאן ובכל מקום.", "What is it about?": "על מה מדובר?", "Tell us what happened. A person can step in at any point.": "ספרו לנו מה קרה. אדם יכול להצטרף בכל שלב.",
    "They have never needed to ask for help.": "הם מעולם לא נזקקו לעזרה.", "No thread": "אין פנייה", "The member has not asked about this booking.": "החבר לא פנה בנוגע להזמנה הזו.", "Duplicate": "שכפול", "Booked by": "הוזמן על ידי",
    "Previous": "הקודם", "Next": "הבא", "What it paid for": "על מה שולם", "First charge": "חיוב ראשון", "This is the only payment on the account.": "זהו התשלום היחיד בחשבון.", "Wallet activity": "פעילות בארנק",
    "Nothing has been charged to this account.": "החשבון הזה טרם חויב.", "Nothing has been booked here through Blissers.": "עדיין לא הוזמן כאן דבר דרך Blissers.", "Nothing logged yet": "עדיין לא נרשם דבר", "Portal login": "כניסה לפורטל",
    "No guests booked today": "אין אורחים שהוזמנו להיום", "Confirmed bookings for today appear here with their arrival time.": "הזמנות מאושרות להיום מופיעות כאן עם שעת ההגעה.",
    "Approvals, refunds and edits made here are listed as they happen.": "אישורים, החזרים ועריכות שנעשים כאן נרשמים בזמן אמת.", "Approvals, refunds and edits appear here.": "אישורים, החזרים ועריכות מופיעים כאן.",
    "A slot is a time the concierge can book into. Click one to close it; booked guests keep their place. Closed slots never appear to members.": "משבצת היא שעה שהקונסיירז׳ יכול להזמין אליה. לחצו על אחת כדי לסגור אותה; אורחים שכבר הוזמנו שומרים את מקומם. משבצות סגורות לעולם לא מוצגות לחברים.",
    "No place here": "אין כאן מקום", "A draft is invisible to members. Set it active and the concierge starts suggesting it the next time a request matches its tags.": "טיוטה אינה נראית לחברים. הפעילו אותה והקונסיירז׳ יתחיל להציע אותה בפעם הבאה שבקשה תתאים לתגיות שלה.",
    "Invited, not yet signed in.": "הוזמנו, טרם נכנסו.", "Resend invite": "שלח הזמנה שוב", "Vendors awaiting review": "ספקים ממתינים לבדיקה", "awaiting review": "ממתינים לבדיקה", "requests waiting": "בקשות ממתינות",
    "One stop fell through. The member has been refunded for it; you can add a replacement from the catalogue or leave the plan as it stands.": "תחנה אחת נפלה. החבר קיבל עליה החזר; אפשר להוסיף תחליף מהקטלוג או להשאיר את התוכנית כפי שהיא.",
    "Nothing kept yet": "עדיין לא נשמר דבר", "Say “remember this” in the concierge after it asks": "אמרו “זכור את זה” לקונסיירז׳ אחרי שישאל", "verified": "מאומת", "not verified": "לא מאומת", "Forget": "שכח", "used until you say otherwise": "בשימוש עד שתגידו אחרת",
    "planned by the concierge": "תוכנן על ידי הקונסיירז׳", "booked direct": "הוזמן ישירות", "card declined": "הכרטיס נדחה", "Priced for two": "מחיר לזוג", "One price for the group": "מחיר אחד לקבוצה",
    "per person": "לאדם", "per couple": "לזוג", "per group": "לקבוצה", "per night": "ללילה", "per table": "לשולחן", "per session": "למפגש", "a person": "לאדם", "a month": "לחודש", "renews": "מתחדש", "joined": "הצטרף", "row": "שורה", "rows": "שורות",
    "charge": "חיוב", "charges": "חיובים", "support thread": "פניית תמיכה", "support threads": "פניות תמיכה", "thing to look at": "דבר אחד לבדוק", "things to look at": "דברים לבדוק", "stop": "תחנה", "stops": "תחנות",
    "sold": "נמכרו", "on hold": "שמורים", "on hold right now": "שמורים כרגע", "Booking": "הזמנה", "Mantra": "מנטרה", "Casa": "קאזה", "Yafo": "יפו", "Ceramics": "קרמיקה",
    "Dana": "דנה", "Rotem": "רותם", "Daniel": "דניאל", "Yonatan": "יונתן", "Tamar": "תמר", "Hila": "הילה", "Lior": "ליאור", "Avi": "אבי", "Maya": "מאיה", "Noa": "נועה", "Omer": "עומר", "Shira": "שירה", "Eitan": "איתן",
    "Gil": "גיל", "Yael": "יעל", "Tom": "תום", "Nava": "נאוה", "Maayan": "מעיין", "Orit": "אורית", "Sami": "סמי", "Leah": "לאה", "Michal": "מיכל", "Gal": "גל", "Ido": "עידו", "Roni": "רוני",
  });

  /* ---------- composed strings: {n} is a slot, each slot is translated on its own ---------- */
  const PATTERNS = [
    ["{1} · Blissers", "{1} · Blissers"], ["{1} · {2} · Blissers", "{1} · {2} · Blissers"],
    ["Hi {1}.", "היי {1}."], ["Hi {1}", "היי {1}"], ["Welcome, {1}", "ברוכים הבאים, {1}"],
    ["Hi {1}. Tell me what you want to do, when, and how many of you. If I need anything else, like a budget, I'll ask.", "היי {1}. אמרו מה בא לכם לעשות, מתי, וכמה אתם. אם אצטרך משהו נוסף, כמו תקציב, אשאל."],
    ["{1} refunded to {2}.", "{1} הוחזרו ל{2}."], ["{1} refunded to {2}", "{1} הוחזרו ל{2}"], ["{1} refunded", "{1} הוחזרו"], ["Cancelled, {1} refunded", "בוטל, {1} הוחזרו"], ["Removed, {1} refunded", "הוסר, {1} הוחזרו"],
    ["Refund, {1}", "החזר, {1}"], ["Refunded {1}", "הוחזר {1}"], ["Redeemed {1}", "מומש {1}"], ["{1} confirmed", "{1} אישר"], ["{1} confirmed.", "{1} אישר."], ["Checked in {1}", "נכנס {1}"], ["{1} checked in", "{1} נכנסו"],
    ["{1} min", "{1} דק׳"], ["{1} km", "{1} ק״מ"], ["{1} km away", "{1} ק״מ משם"], ["{1} less", "{1} פחות"], ["{1} more", "{1} יותר"], ["{1} over", "{1} מעל"], ["{1} unspent", "{1} לא נוצלו"], ["{1} each", "{1} כל אחד"], ["{1} left", "נותרו {1}"],
    ["{1} reviews", "{1} ביקורות"], ["{1} · {2} reviews", "{1} · {2} ביקורות"], ["rated {1} by {2} members", "דורג {1} על ידי {2} חברים"], ["{1} of 5", "{1} מתוך 5"], ["{1} of {2}", "{1} מתוך {2}"], ["{1} people", "{1} אנשים"],
    ["{1} points", "{1} נקודות"], ["points · worth {1}", "נקודות · שוות {1}"], ["Points · worth {1}", "נקודות · שוות {1}"], ["+{1} pts", "+{1} נק׳"], ["{1} pts", "{1} נק׳"], ["{1} added", "{1} נוספו"], ["Top-up from {1}", "טעינה מ{1}"],
    ["{1} in the wallet", "{1} בארנק"], ["{1} in your wallet", "{1} בארנק שלך"], ["Voucher {1} · in your wallet", "שובר {1} · בארנק שלך"], ["Pass {1} · in your wallet", "כרטיס {1} · בארנק שלך"], ["{1} member", "חבר {1}"], ["{1} member · {2}", "חבר {1} · {2}"], ["{1} plan", "מסלול {1}"], ["{1} plan from today", "מסלול {1} מהיום"],
    ["{1} a month", "{1} לחודש"], ["Step {1} of 2", "שלב {1} מתוך 2"], ["{1} nights", "{1} לילות"], ["{1} guests", "{1} אורחים"], ["{1} stops", "{1} תחנות"], ["{1} days", "{1} ימים"], ["{1} tickets", "{1} כרטיסים"], ["{1} ticket", "כרטיס {1}"],
    ["{1} seats", "{1} מקומות"], ["{1} offers", "{1} הצעות"], ["{1} events", "{1} אירועים"], ["{1} bookings", "{1} הזמנות"], ["{1} vendors", "{1} ספקים"], ["{1} users", "{1} משתמשים"], ["{1} members", "{1} חברים"], ["{1} payments", "{1} תשלומים"], ["{1} slots", "{1} משבצות"],
    ["{1} live offers", "{1} הצעות פעילות"], ["{1} live offer", "הצעה פעילה {1}"], ["{1} open slots", "{1} משבצות פתוחות"], ["{1} open slot", "משבצת פתוחה {1}"], ["{1} draft offers", "{1} הצעות טיוטה"], ["{1} live vendors", "{1} ספקים פעילים"], ["{1} active members", "{1} חברים פעילים"],
    ["{1} upcoming bookings", "{1} הזמנות קרובות"], ["{1} upcoming booking", "הזמנה קרובה {1}"], ["{1} support threads", "{1} פניות תמיכה"], ["{1} support thread", "פנייה לתמיכה {1}"], ["{1} free tickets", "{1} כרטיסי חינם"], ["{1} free ticket", "כרטיס חינם {1}"],
    ["all {1}", "כל ה-{1}"], ["in {1}", "ב{1}"], ["on {1}", "ב{1}"], ["at {1}", "ב{1}"], ["for {1}", "עבור {1}"], ["{1} at {2}", "{1} ב{2}"], ["{1} at {2}: {3}.", "{1} ב{2}: {3}."], ["{1}, {2} {3}. Code {4}", "{1}, {2} {3}. קוד {4}"],
    ["At {1}", "ב{1}"], ["Hold {1} · {2}", "החזק {1} · {2}"], ["Get {1}", "קח {1}"], ["Pay {1}", "שלם {1}"], ["Charging {1}", "מחייב {1}"], ["Swipe to pay {1}", "החליקו לתשלום {1}"], ["Swipe to pay {1} with {2}", "החליקו לתשלום {1} עם {2}"],
    ["Book {1} {2} · {3}", "הזמן {1} {2} · {3}"], ["Reserve {1}", "הזמן {1}"], ["Drop {1}?", "להוריד את {1}?"], ["Switched to {1}", "הוחלף ל{1}"], ["Review and pay · {1}", "סקירה ותשלום · {1}"], ["No {1} match", "אין {1} מתאימים"], ["Only {1} left.", "נותרו רק {1}."],
    ["You said up to {1}", "אמרתם עד {1}"], ["Left open, so the concierge set a {1} cap", "הושאר פתוח, אז הקונסיירז׳ קבע תקרה של {1}"], ["Usual {1}–{2}, ceiling {3}", "בדרך כלל {1}–{2}, תקרה {3}"],
    ["This plan is {1}, over the {2} cap. Go ahead anyway?", "התוכנית הזו {1}, מעל התקרה של {2}. להמשיך בכל זאת?"], ["Well within the {1} {2}", "בנוחות בתוך ה-{1} {2}"], ["Within your {1}% flexibility margin", "בתוך מרווח הגמישות של {1}%"],
    ["Near the top of the {1} {2}", "קרוב לקצה ה-{1} {2}"], ["Close to the {1} {2}", "קרוב ל-{1} {2}"], ["Over the {1} {2}", "מעל ה-{1} {2}"], ["Against your {1}", "מול ה-{1} שלכם"], ["Against {1} for {2} days from your usual ceiling", "מול {1} ל-{2} ימים מהתקרה הרגילה שלכם"],
    ["You left the budget open, so I capped it at {1}; against that", "השארתם את התקציב פתוח, אז הגבלתי אותו ל-{1}; מול זה"], ["up to {1}, as you said", "עד {1}, כמו שאמרתם"], ["up to {1} since you left it open", "עד {1} כי השארתם פתוח"], ["your usual {1}–{2}", "הרגיל שלכם {1}–{2}"],
    ["usual budget up to {1}", "תקציב רגיל עד {1}"], ["Kept. I'll take up to {1} as your usual budget and only ask again for something a different size, like a trip. It's on your profile if you want to drop it.", "שמרתי. אקח עד {1} כתקציב הרגיל שלכם ואשאל שוב רק על משהו בגודל אחר, כמו טיול. זה בפרופיל אם תרצו למחוק."],
    ["Noted: {1}. Want me to remember that for next time, or only use it now?", "רשמתי: {1}. לזכור לפעם הבאה, או להשתמש רק עכשיו?"],
    ["{1} for {2}. Which dates?", "{1} ל{2}. אילו תאריכים?"], ["{1} from {2} for {3}. Roughly what's the budget for the whole trip, stay included? A rough number is fine, or leave it open.", "{1} מ{2} ל{3}. בערך מה התקציב לכל הטיול, כולל לינה? מספר גס מספיק, או השאירו פתוח."],
    ["{1} tonight for {2}.", "{1} הערב ל{2}."], ["{1} tomorrow for {2}.", "{1} מחר ל{2}."], ["{1} for {2}.", "{1} ל{2}."], ["Roughly what would you like to spend{1}? A rough number is fine.", "בערך כמה תרצו להוציא{1}? מספר גס מספיק."], [" for the two of you", " על שניכם"],
    ["Nothing registered for {1} is open {2}. Want me to look at another kind of evening, or another day?", "שום מקום רשום ב{1} לא פתוח {2}. לבדוק סוג אחר של ערב, או יום אחר?"],
    ["Nothing registered for {1} fits under your {2} ceiling {3}. The closest is {4} at {5}, {6} over, and I won't book it unless you say so.", "שום מקום רשום ב{1} לא נכנס מתחת לתקרה של {2} {3}. הקרוב ביותר הוא {4} ב-{5}, {6} מעל, ולא אזמין אותו בלי אישורכם."],
    ["For {1}, {2} is the one. {3}", "ל{1}, {2} הוא הבחירה. {3}"], ["For {1}, {2} is the one.", "ל{1}, {2} הוא הבחירה."], ["For {1}, {2}. {3} {4} all in, {5}.", "ל{1}, {2}. {3} {4} הכול כלול, {5}."], ["For {1}, {2}.", "ל{1}, {2}."],
    ["They have {1} at {2}.", "יש להם {1} ב-{2}."], ["a table for {1}", "שולחן ל{1}"], ["{1}, then {2}", "{1}, ואז {2}"],
    ["It's {1} from {2}, and {3} leaves time {4}.", "זה {1} מ{2}, ו-{3} משאיר זמן {4}."], ["{1} I can also add {2} if that helps.", "{1} אני יכול גם להוסיף {2} אם זה עוזר."], ["{1} I can add {2} if that helps.", "{1} אני יכול להוסיף {2} אם זה עוזר."], ["I can also add {1} if that helps.", "אני יכול גם להוסיף {1} אם זה עוזר."], ["I can add {1} if that helps.", "אני יכול להוסיף {1} אם זה עוזר."],
    ["{1} days, {2} bookable stops{3}", "{1} ימים, {2} תחנות להזמנה{3}"], ["Upgrade offer: {1}", "הצעת שדרוג: {1}"], ["{1} Open the plan for the day-by-day and the budget sheet.", "{1} פתחו את התוכנית ליום-יום ולגיליון התקציב."],
    ["{1} Open the plan to swap or drop a stop, or tell me what's off. One swipe pays every vendor at once.", "{1} פתחו את התוכנית להחלפה או הורדה של תחנה, או אמרו מה לא מתאים. החלקה אחת משלמת לכל הספקים בבת אחת."],
    ["Open the plan for the day-by-day and the budget sheet.", "פתחו את התוכנית ליום-יום ולגיליון התקציב."], ["Open the plan to swap or drop a stop, or tell me what's off. One swipe pays every vendor at once.", "פתחו את התוכנית להחלפה או הורדה של תחנה, או אמרו מה לא מתאים. החלקה אחת משלמת לכל הספקים בבת אחת."],
    ["Total {1} (+{2})", "סה״כ {1} (+{2})"], ["Total {1} (−{2})", "סה״כ {1} (−{2})"], ["Total {1} ({2})", "סה״כ {1} ({2})"], ["Total {1}", "סה״כ {1}"], ["Now for {1}.", "עכשיו ל{1}."], ["{1} stops unchanged", "{1} תחנות ללא שינוי"],
    ["Moved everything an hour {1}.", "הזזתי הכול שעה {1}."], ["now {1}", "עכשיו {1}"], ["Added {1}.", "הוספתי {1}."], ["Added {1} at {2} to your plan. New total {3}, {4}.", "הוספתי {1} ב-{2} לתוכנית. סה״כ חדש {3}, {4}."],
    ["{1}: {2}, central to every day.", "{1}: {2}, מרכזי לכל יום."], ["{1} moved from {2}", "{1} הועברו מ{2}"], ["{1} instead of the massages costs {2} more. {3}", "{1} במקום העיסויים עולה {2} יותר. {3}"], ["{1}: the full treatment, side by side.", "{1}: הטיפול המלא, זה לצד זה."],
    ["The {1} unspent covers it", "ה-{1} שלא נוצלו מכסים את זה"], ["Using the {1} unspent and {2} of the buffer", "בשימוש ב-{1} שלא נוצלו ו-{2} מהרזרבה"],
    ["{1} within 4 km, approved vendors only: {2} live offers{3}", "{1} בטווח 4 ק״מ, ספקים מאושרים בלבד: {2} הצעות פעילות{3}"], ["Availability {1} for {2}: {3} open", "זמינות {1} ל{2}: {3} פתוחים"], ["Ranked for {1}{2}", "דורג לפי {1}{2}"],
    [", must have {1}", ", חייב {1}"], [", avoiding {1}", ", נמנע מ{1}"], ["{1} that differ", "{1} שנבדלים"], ["{1} around {2}", "{1} בסביבות {2}"], ["around {1}", "בסביבות {1}"], ["missing {1}", "חסר {1}"],
    ["Holding {1} at {2} for {3} on {4} while you pay. {5}, {6}.", "מחזיק {1} ב{2} ל{3} ב{4} בזמן התשלום. {5}, {6}."],
    ["{1} · nothing charged yet", "{1} · עדיין לא חויב דבר"], ["{1} could not hold {2}.", "{1} לא הצליח להחזיק {2}."], ["{1} could not hold it", "{1} לא הצליח להחזיק"], ["Held. Quote moved from {1} to {2}.", "מוחזק. המחיר זז מ{1} ל{2}."], ["{1} is holding {2}.", "{1} מחזיק {2}."],
    ["{1} quotes {2} at {3} now, {4} more than when I planned it. Every hold is still in place and nothing is charged.", "{1} מתמחר עכשיו {2} ב-{3}, {4} יותר מאשר כשתכננתי. כל החזקה עדיין במקומה ולא חויב דבר."],
    ["{1} at {2} is gone. The other {3} still in place and nothing is charged. Swap it, drop it, or let everything go.", "{1} ב-{2} נעלם. {3} האחרות עדיין במקומן ולא חויב דבר. החליפו, הורידו, או שחררו הכול."],
    ["{1} asked for a second look. The holds stay in place, nothing is confirmed with vendors until it clears, and your money isn’t taken.", "{1} ביקש בדיקה נוספת. ההחזקות נשארות, שום דבר לא מאושר מול הספקים עד שיאושר, והכסף שלכם לא נלקח."],
    ["{1} is fully booked at {2}. {3} refunded to {4}.", "{1} מלא לגמרי ב-{2}. {3} הוחזרו ל{4}."], ["{1} confirmed. {2}, {3}.", "{1} אישר. {2}, {3}."], ["{1} confirmed {2}. {3}.", "{1} אישר {2}. {3}."],
    ["{1} The holds were released, nothing was booked and nothing was charged.", "{1} ההחזקות שוחררו, לא הוזמן דבר ולא חויב דבר."], ["Holds good for {1} min", "ההחזקות תקפות {1} דק׳"],
    ["Demo only. Pick how the {1} should go, then swipe.", "דמו בלבד. בחרו איך {1} אמור להתנהל, ואז החליקו."],
    ["Every vendor is told and {1} goes back to your payment method.", "כל ספק מעודכן ו-{1} חוזרים לאמצעי התשלום שלכם."], ["The first stop is less than 24 hours away, so the {1} is not refunded.", "התחנה הראשונה בעוד פחות מ-24 שעות, לכן {1} לא מוחזרים."],
    ["You are holding {1}. Pay before {2} runs out.", "אתם מחזיקים {1}. שלמו לפני ש{2} נגמר."], ["You have {1}. Code {2}.", "יש לכם {1}. קוד {2}."], ["Show this at the door. One code covers all {1} tickets.", "הציגו את זה בכניסה. קוד אחד מכסה את כל {1} הכרטיסים."],
    ["Ticket {1}", "כרטיס {1}"], ["Ticket · {1}", "כרטיס · {1}"], ["Tickets · {1}", "כרטיסים · {1}"], ["Ticket code {1}", "קוד כרטיס {1}"], ["Hold until {1}", "מוחזק עד {1}"], ["{1}% sold", "{1}% נמכרו"], ["{1} this month · {2} of yours", "{1} החודש · {2} שלכם"],
    ["{1} · {2} · {3} of {4} sold", "{1} · {2} · {3} מתוך {4} נמכרו"], ["{1} · {2} · {3} · {4} of {5} sold", "{1} · {2} · {3} · {4} מתוך {5} נמכרו"], ["{1} on sale", "{1} במכירה"], ["{1} across {2}", "{1} אצל {2}"],
    ["Booking {1}", "הזמנה {1}"], ["Payment {1}", "תשלום {1}"], ["Payment {1} failed", "תשלום {1} נכשל"], ["{1} still held.", "{1} עדיין מוחזקים."], ["Other charges by {1}", "חיובים אחרים של {1}"], ["{1} · net {2}", "{1} · נטו {2}"],
    ["{1} is treated as cleared and the vendors are asked to confirm.", "{1} נחשב כמאושר והספקים מתבקשים לאשר."], ["Settled {1} by hand", "{1} סולק ידנית"], ["{1} marked failed: {2}", "{1} סומן כנכשל: {2}"], ["{1} is charged again to the same {2}.", "{1} מחויב שוב לאותו {2}."], ["Retried {1}", "{1} נוסה שוב"],
    ["Edit {1}", "ערוך {1}"], ["Cancel {1}?", "לבטל את {1}?"], ["Admin cancelled {1}", "המנהל ביטל את {1}"], ["Admin confirmed {1} on {2}", "המנהל אישר את {1} ב{2}"], ["Admin added {1} to {2}", "המנהל הוסיף {1} ל{2}"], ["Admin edited {1}", "המנהל ערך את {1}"],
    ["{1} goes back to the member and the vendor is told. The rest of the plan stays.", "{1} חוזרים לחבר והספק מעודכן. שאר התוכנית נשארת."], ["The member is charged {1} at the offer price once the vendor confirms. It appears on their plan straight away as awaiting the vendor.", "החבר מחויב {1} במחיר ההצעה ברגע שהספק מאשר. זה מופיע בתוכנית שלו מיד כממתין לספק."],
    ["{1} still waiting on a vendor", "{1} עדיין ממתינות לספק"], ["{1} is waiting for review", "{1} ממתין לבדיקה"], ["{1} · applied {2}", "{1} · הגיש בקשה {2}"], ["{1} is only partly confirmed", "{1} אושרה רק חלקית"], ["{1} needs an agent", "{1} צריכה נציג"], ["{1} · {2} to look at", "{1} · {2} לבדיקה"],
    ["Cannot be below the {1} already sold or held.", "לא יכול להיות מתחת ל-{1} שכבר נמכרו או מוחזקים."], ["{1} offer “{2}”", "{1} הצעה “{2}”"], ["{1} (copy)", "{1} (עותק)"], ["Everything booked through Blissers to {1}", "כל מה שהוזמן דרך Blissers עד {1}"],
    ["{1} booked · {2}% commission", "{1} הוזמנו · {2}% עמלה"], ["Commission at {1}%", "עמלה של {1}%"], ["{1} · {2} · {3}% commission", "{1} · {2} · {3}% עמלה"], ["{1} added as a vendor", "{1} נוסף כספק"], ["Approve {1}?", "לאשר את {1}?"], ["Reject {1}?", "לדחות את {1}?"],
    ["Suspend {1}?", "להשעות את {1}?"], ["Reactivate {1}?", "להפעיל מחדש את {1}?"], ["Invite sent again to {1}", "ההזמנה נשלחה שוב ל{1}"], ["{1} · {2} invited", "{1} · {2} הוזמנו"], ["Vendor{1}", "ספק{1}"], ["Vendor {1}", "ספק {1}"],
    ["{1} in the next seven days", "{1} בשבעת הימים הקרובים"], ["{1} of {2} booked", "{1} מתוך {2} הוזמנו"], ["No slots on {1}", "אין משבצות ב{1}"], ["{1} reopened", "{1} נפתחה מחדש"], ["{1} closed", "{1} נסגרה"], ["Add a slot on {1}", "הוסף משבצת ב{1}"],
    ["This booking has no stop at {1}.", "להזמנה הזו אין תחנה ב{1}."], ["Declined: {1}", "נדחה: {1}"], ["{1} waiting · {2}", "{1} ממתינות · {2}"], ["This listing is suspended. {1}", "הרישום הזה מושעה. {1}"], ["That code belongs to another vendor's booking, not {1}.", "הקוד הזה שייך להזמנה של ספק אחר, לא {1}."],
    ["Already redeemed {1}.", "כבר מומש {1}."], ["This stop is {1}, so it can't be redeemed.", "התחנה הזו {1}, לכן אי אפשר לממש אותה."], ["That ticket is for {1}, not tonight's door.", "הכרטיס הזה ל{1}, לא לכניסה של הערב."], ["Already checked in at {1}.", "כבר נכנס ב-{1}."], ["Ticket is {1}, not paid.", "הכרטיס {1}, לא שולם."],
    ["Results for “{1}”", "תוצאות עבור “{1}”"], ["Ask the concierge about {1}", "שאל את הקונסיירז׳ על {1}"], ["Ask about {1}", "שאל על {1}"], ["About {1}", "על {1}"], ["{1}, Tel Aviv", "{1}, תל אביב"], ["Remove {1}?", "להסיר את {1}?"], ["Sent to {1}", "נשלח אל {1}"],
    ["{1} set to {2}", "{1} הוגדר ל{2}"], ["Dropped: {1}", "הורד: {1}"], ["{1} · {2} at {3} · {4}", "{1} · {2} ב-{3} · {4}"], ["{1} · {2} · {3} at {4}", "{1} · {2} · {3} ב-{4}"], ["Start a plan {1}", "התחל תוכנית {1}"],
    ["{1} daytime", "{1} ביום"], ["{1} evening", "{1} בערב"], ["Tomorrow {1}", "מחר {1}"], ["Tonight {1}", "הערב {1}"],
    ["{1} and {2}", "{1} ו{2}"], ["{1}, {2}", "{1}, {2}"],
    ["{1} on {2} for {3}.", "{1} ב{2} ל{3}."], ["{1} on {2} for {3}. {4}", "{1} ב{2} ל{3}. {4}"], ["{1} tonight for {2}. {3}", "{1} הערב ל{2}. {3}"], ["{1} tomorrow for {2}. {3}", "{1} מחר ל{2}. {3}"], ["{1} for {2}. {3}", "{1} ל{2}. {3}"],
    ["{1} from {2} for {3}. {4}", "{1} מ{2} ל{3}. {4}"], ["Something {1} for {2}.", "משהו {1} ל{2}."],
    /* found by the Hebrew audit on 7 Oct 2026 */
    ["{1} row", "{1} שורה"], ["{1} rows", "{1} שורות"], ["{1} charges", "{1} חיובים"], ["{1} charge", "{1} חיוב"], ["{1} awaiting review", "{1} ממתינים לבדיקה"], ["{1} requests waiting", "{1} בקשות ממתינות"], ["{1} request waiting", "בקשה {1} ממתינה"],
    ["{1} · {2} stops. Your code is {3}.", "{1} · {2} תחנות. הקוד שלכם הוא {3}."], ["{1} · {2} stop. Your code is {3}.", "{1} · תחנה {2}. הקוד שלכם הוא {3}."], ["Your code is {1}.", "הקוד שלכם הוא {1}."],
    ["{1} sold, {2} on hold right now.", "{1} נמכרו, {2} שמורים כרגע."], ["{1} on hold", "{1} שמורים"], ["{1} per person", "{1} לאדם"], ["{1} per couple", "{1} לזוג"], ["{1} per group", "{1} לקבוצה"], ["{1} per night", "{1} ללילה"],
    ["{1} per table", "{1} לשולחן"], ["{1} per session", "{1} למפגש"], ["{1} each", "{1} לאדם"], ["Up to {1} a person", "עד {1} לאדם"],
    ["renews {1}", "מתחדש {1}"], ["{1} a month · renews {2}", "{1} לחודש · מתחדש {2}"], ["{1} things to look at", "{1} דברים לבדוק"], ["{1} thing to look at", "דבר {1} לבדוק"], ["joined {1}", "הצטרף {1}"], ["{1} · joined {2}", "{1} · הצטרף {2}"],
    ["Next up, {1}", "הבא בתור, {1}"], ["Good morning, {1}", "בוקר טוב, {1}"], ["Good afternoon, {1}", "צהריים טובים, {1}"], ["Good evening, {1}", "ערב טוב, {1}"], ["Redeem {1}", "מימוש {1}"], ["Kept {1} · used until you say otherwise", "נשמר {1} · בשימוש עד שתגידו אחרת"],
    ["Phone {1} · verified", "טלפון {1} · מאומת"], ["Phone {1} · not verified", "טלפון {1} · לא מאומת"], ["Forget {1}", "שכח {1}"],
    ["Applied {1}. Approving makes the listing live and turns their {2} draft offers active.", "הגישו בקשה {1}. אישור יפרסם את הרישום ויפעיל את {2} הצעות הטיוטה שלהם."], ["Applied {1}. Approving makes the listing live and turns their {2} draft offer active.", "הגישו בקשה {1}. אישור יפרסם את הרישום ויפעיל את הצעת הטיוטה {2} שלהם."],
    ["The bank declined it: {1}. The member was asked to try another card and nothing was sent to the vendors.", "הבנק דחה את החיוב: {1}. החבר התבקש לנסות כרטיס אחר ודבר לא נשלח לספקים."],
    ["Suspended: {1}. Members cannot see or book this vendor.", "מושעה: {1}. חברים לא יכולים לראות או להזמין את הספק הזה."], ["Suspended: {1} Members cannot see or book this vendor.", "מושעה: {1} חברים לא יכולים לראות או להזמין את הספק הזה."],
    ["{1} support thread about this booking, in the mobile app.", "פניית תמיכה {1} על ההזמנה הזו, באפליקציה."], ["{1} support threads about this booking, in the mobile app.", "{1} פניות תמיכה על ההזמנה הזו, באפליקציה."],
    ["· {1} · {2}", "· {1} · {2}"], ["· {1}", "· {1}"],
  ];

  /* ---------- Hebrew the member types to the concierge, turned into the English its parser knows ---------- */
  const HE_IN = [
    [/ארוחת ערב|לאכול ערב/g, "dinner"], [/ארוחת צהריים|צהריים/g, "lunch"], [/מסעד[הות]+|שולחן/g, "restaurant"], [/לאור נרות/g, "candlelit"], [/שקט[הים]*/g, "quiet"], [/רומנטי[ת]?/g, "romantic"],
    [/ספא|עיסוי|מסאז׳|מסאז'|חמאם/g, "spa"], [/יוגה/g, "yoga"], [/בר[ים]?\b|קוקטייל[ים]?|משקאות/g, "drinks bar"], [/מסיבה|לרקוד|חיי לילה|מועדון/g, "party"], [/סדנ[הא]ות?|קרמיקה|אובניים/g, "workshop"],
    [/מוזיאון|סיור|תרבות|הצגה|תיאטרון|ג׳אז|ג'אז|קונצרט/g, "culture show"], [/מלון|לינה|סוויטה|סוף שבוע בחוץ|חופשה|טיול/g, "hotel trip"], [/ים\b|שייט|גלישה|על המים|חוף/g, "on the water"],
    [/סוף השבוע הבא|סופ״ש הבא/g, "next weekend"], [/סוף השבוע|סופ״ש|סופ"ש/g, "this weekend"], [/הערב|הלילה/g, "tonight"], [/מחר בערב/g, "tomorrow evening"], [/מחר/g, "tomorrow"], [/ביום\b|בצהריים|בבוקר/g, "daytime"],
    [/יום ראשון|ביום א׳|ביום א'/g, "sunday"], [/יום שני|ביום ב׳/g, "monday"], [/יום שלישי|ביום ג׳/g, "tuesday"], [/יום רביעי|ביום ד׳/g, "wednesday"], [/יום חמישי|ביום ה׳/g, "thursday"], [/יום שישי|ביום ו׳/g, "friday"], [/שבת/g, "saturday"],
    [/רק אני|לבד|לאדם אחד/g, "just me"], [/לשניים|שנינו|זוג|לשנינו/g, "for two"], [/לשלושה/g, "for three"], [/לארבעה|ארבעתנו/g, "for four"], [/לחמישה/g, "for five"], [/לשישה/g, "for six"], [/(\d+)\s*אנשים/g, "for $1"],
    [/(\d+)\s*לילות|לילה אחד/g, (m, n) => `${n || 1} nights`], [/שני לילות/g, "2 nights"], [/שלושה לילות/g, "3 nights"],
    [/תקציב/g, "budget"], [/בערך|בסביבות|בסביבה של/g, "around"], [/עד\s*(?=₪|\d)/g, "up to "], [/הפתע אותי|תפתיע אותי/g, "surprise me"], [/השאר פתוח|פתוח/g, "leave it open"],
    [/זכור את התקציב הזה|תזכור את התקציב/g, "remember this budget"], [/זכור את זה|תזכור/g, "remember this"], [/רק לעכשיו/g, "just for now"], [/כן,? תוסיף|כן/g, "yes, add it"], [/לא תודה|לא/g, "no thanks"],
    [/התחל מחדש|מחדש|תוכנית חדשה|משהו אחר/g, "start over"], [/סקור תוכנית|תראה את התוכנית/g, "review plan"], [/יותר זול|זול יותר|תעשה זול/g, "make it cheaper"], [/יותר שקט|שקט יותר|תעשה שקט/g, "make it quieter"],
    [/החלף|שדרג|קח את השדרוג/g, "switch"], [/השאר|תשאיר/g, "keep it"], [/מוקדם יותר|יותר מוקדם/g, "earlier"], [/מאוחר יותר|יותר מאוחר/g, "later"], [/הורד|תוריד|בלי|להסיר/g, "drop"], [/תוסיף|הוסף|וגם/g, "add"],
    [/הליכה|ברגל/g, "walk"], [/מונית|מוניות/g, "taxi"], [/בלי בר|לא שותים/g, "no bar"], [/בלי ספא/g, "no spa"], [/בלי ארוחת ערב|כבר אכלנו/g, "no dinner"], [/בלי מלון/g, "no hotel"],
    [/יום הולדת|חגיגה|לחגוג|יום נישואין/g, "celebration"], [/לפני/g, "before"], [/אחרי|ואז/g, "after"], [/רגוע|מרגיע|להירגע/g, "relax"], [/רועש|תוסס|חי/g, "lively"], [/בחוץ/g, "outdoor"], [/שקיעה/g, "sunset"], [/נוף/g, "view"],
  ];
  api.toEnglish = (s) => {
    if (!/[֐-׿]/.test(s)) return s;
    let out = s;
    HE_IN.forEach(([re, to]) => { out = out.replace(re, to); });
    return out.replace(/[֐-׿]+/g, "").replace(/\s+/g, " ").trim();
  };

  /* ---------- the translator ---------- */
  const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const literal = (p) => p.replace(/\{\d\}/g, "").length;
  const compiled = PATTERNS.slice().sort((a, b) => literal(b[0]) - literal(a[0])).map(([from, to]) => {
    const re = new RegExp("^" + esc(from).replace(/\\\{(\d)\\\}/g, "(.+?)") + "$", "s");
    return [re, to, from.includes(" · ")];
  });
  const cache = new Map();
  const hasLatin = (s) => /[A-Za-z]/.test(s);

  function core(s, depth) {
    if (Object.prototype.hasOwnProperty.call(DICT, s)) return DICT[s];
    const flip = /^[a-z]/.test(s) ? s.charAt(0).toUpperCase() + s.slice(1) : s.charAt(0).toLowerCase() + s.slice(1);
    if (Object.prototype.hasOwnProperty.call(DICT, flip)) return DICT[flip];
    if (depth > 8) return s;
    const dotted = s.includes(" · ");
    for (let i = 0; i < compiled.length; i++) {
      if (dotted && !compiled[i][2]) continue;
      const m = s.match(compiled[i][0]);
      if (!m) continue;
      let ok = true;
      /* a slot that stays English is fine when it is a name or a code; a whole English phrase left inside a Hebrew sentence is not */
      const out = compiled[i][1].replace(/\{(\d)\}/g, (_, n) => { const v = m[Number(n)]; if (v == null) { ok = false; return ""; } const tr = t(v, depth + 1); if (/[a-z]{2,}/.test(tr) && !/^[A-Z][^\s]*$/.test(v.trim())) ok = false; return tr; });
      if (ok) return out;
    }
    if (dotted) return s.split(" · ").map((p) => t(p, depth + 1)).join(" · ");
    /* a sentence ends at punctuation followed by a space, so "4.8" and "19:30." stay whole */
    const sentences = s.split(/(?<=[.!?…])\s+(?=\S)/);
    if (sentences.length > 1) {
      let all = true;
      const out = sentences.map((x) => { const tr = t(x, depth + 1); if (tr === x && hasLatin(x)) all = false; return tr; }).join(" ");
      if (all) return out;
    }
    const pm = s.match(/^(.+?)([.:…?!,]+)$/);
    if (pm) { const tr = t(pm[1], depth + 1); if (tr !== pm[1]) return tr + pm[2]; }
    const parts = s.split(/,\s+|\s+·\s+/);
    if (parts.length > 1) {
      const out = parts.map((p) => t(p, depth + 1));
      if (out.every((p, i) => p !== parts[i] || !hasLatin(parts[i]))) return out.join(", ");
    }
    /* word by word, only when the whole thing comes out Hebrew or it is a short label */
    const words = s.split(/(\s+)/);
    const ww = words.map((w) => (/\s/.test(w) || !hasLatin(w)) ? w : (() => { const m = w.match(/^([^A-Za-z]*)([A-Za-z][A-Za-z'’-]*)([^A-Za-z]*)$/); if (!m) return w; const tr = Object.prototype.hasOwnProperty.call(DICT, m[2]) ? DICT[m[2]] : m[2]; return m[1] + tr + m[3]; })());
    const joined = ww.join("");
    if (joined !== s && !hasLatin(joined)) return joined;
    return s;
  }
  function t(s, depth) {
    if (s == null) return s;
    s = String(s);
    if (!hasLatin(s)) return s;
    const m = s.match(/^(\s*)([\s\S]*?)(\s*)$/);
    const inner = m[2].replace(/\s+/g, " ");
    let out;
    if (cache.has(inner)) out = cache.get(inner);
    else { out = core(inner, depth || 0); if (!depth) cache.set(inner, out); }
    return m[1] + out + m[3];
  }
  api.t = (s) => t(s, 0);

  /* ---------- the DOM: translate what is there, then everything that arrives ---------- */
  const ATTRS = ["placeholder", "aria-label", "title", "alt", "data-empty"];
  const SKIP = { SCRIPT: 1, STYLE: 1, TEXTAREA: 1, CODE: 1, PRE: 1 };
  const seen = new WeakMap();
  const skipEl = (el) => { for (let e = el; e && e.nodeType === 1; e = e.parentNode) { if (SKIP[e.tagName] || e.getAttribute("translate") === "no") return true; } return false; };
  function textNode(n) {
    const v = n.data;
    if (seen.get(n) === v) return;
    if (!hasLatin(v) || skipEl(n.parentNode)) { seen.set(n, v); return; }
    const tr = t(v, 0);
    if (tr !== v) n.data = tr;
    seen.set(n, n.data);
  }
  /* A textarea's text is the member's own and stays alone, but its placeholder and label are
     ours: skip from the parent up, not from the textarea itself. */
  function attrs(el) {
    if (el.nodeType !== 1 || el.getAttribute("translate") === "no" || skipEl(el.tagName === "TEXTAREA" ? el.parentNode : el)) return;
    ATTRS.forEach((a) => { if (!el.hasAttribute(a)) return; const v = el.getAttribute(a); const tr = t(v, 0); if (tr !== v) el.setAttribute(a, tr); });
    if (el.tagName === "INPUT" && /^(submit|button|reset)$/i.test(el.type) && el.value) { const tr = t(el.value, 0); if (tr !== el.value) el.value = tr; }
  }
  function walk(node) {
    if (node.nodeType === 3) { textNode(node); return; }
    if (node.nodeType !== 1 && node.nodeType !== 9 && node.nodeType !== 11) return;
    if (node.nodeType === 1) { if (SKIP[node.tagName]) return; attrs(node); }
    const w = document.createTreeWalker(node, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT, null);
    let c;
    while ((c = w.nextNode())) { if (c.nodeType === 3) textNode(c); else attrs(c); }
  }
  const obs = new MutationObserver((records) => {
    records.forEach((r) => {
      if (r.type === "characterData") textNode(r.target);
      else if (r.type === "attributes") attrs(r.target);
      else r.addedNodes.forEach(walk);
    });
  });
  obs.observe(root, { childList: true, characterData: true, subtree: true, attributes: true, attributeFilter: ATTRS });
  walk(root);
  document.addEventListener("DOMContentLoaded", () => walk(root));
})();
