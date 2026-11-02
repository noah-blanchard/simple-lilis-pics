# 04 · Copy deck (EN + Québec French)

> The complete text of the wedding site as the two message files. Phases paste
> the namespaces they need into `apps/wedding/messages/{en,fr}.json`. Do not
> rewrite copy during a phase. If a string is missing, add it to **both**
> languages in this voice, and list it in the phase report.
>
> Everything here is a **draft for Lili's approval**. Lines that state a fact
> about her business are listed in §6 and must not be changed by the agent.

## 1. Voice

- **Lili, first person, talking to one couple.** Warm, calm, practical. Short sentences.
- **Concrete over abstract:** a parent checking the time; shoes off at midnight.
- **Reassuring** for couples who do not like being photographed.
- Follow the copy bans in [`03-guardrails.md`](03-guardrails.md) §2.

## 2. Conventions

- **Accent words** in the hero title are wrapped in `**…**` and rendered with the `renderAccentLine` grammar.
- **Section headings** come as two keys: `titleBase` (plain) and `titleAccent` (italic accent line). They feed `SectionHeader`.
- **Arrays** (`items`, `steps`, `groups`, `body`) are read with `t.raw("…")` and typed at the call site. `apps/web/src/lib/messages.ts` (`rawList`) shows the pattern; copy it into `apps/wedding/src/lib/messages.ts` in phase 05.
- **Rich text** (`<link>…</link>`) is rendered with `t.rich`.
- **French typography.** The JSON uses escapes so the spaces stay visible in review:
  - ` ` (narrow no-break space) before `? ! : ;` and inside `« »`;
  - ` ` (no-break space) inside amounts such as `3 000 $`.

  Keep the escapes as they are; JSON decodes them.
- **Times, prices and seasons** are formatted in code (`apps/wedding/src/lib/format.ts`), never written in copy.

## 3. `apps/wedding/messages/en.json`

```json
{
  "meta": {
    "title": "Lilis Pics · Weddings",
    "description": "Wedding photographer in Montréal and across Québec. Lili photographs your day as it happens, from the morning to the last dance.",
    "storiesTitle": "Wedding stories",
    "storiesDescription": "Whole wedding days photographed by Lili, from the first hour to the last.",
    "rsvpTitle": "Check your date",
    "rsvpDescription": "Tell Lili about your wedding. It takes about a minute.",
    "privacyTitle": "Privacy policy",
    "privacyDescription": "How Lili handles the details you send through this site."
  },
  "nav": {
    "menu": "Menu",
    "close": "Close",
    "email": "hello@lilispics.com",
    "logoAlt": "Lilis Pics, weddings, home",
    "skip": "Skip to content",
    "localeLabel": "Language",
    "items": {
      "stories": "Stories",
      "day": "Your day",
      "collections": "Collections",
      "questions": "Questions",
      "reply": "Check your date",
      "portfolio": "Portfolio"
    }
  },
  "hero": {
    "host": "Lili, photographer",
    "lead": "is delighted to invite you",
    "title": "to **simply** be there",
    "lead2": "on your wedding day,",
    "place": "in Montréal, elsewhere in Québec, or wherever you say yes.",
    "reassurance": "You don't need to know how to pose. I stay close, quietly, and keep the day the way you lived it.",
    "availability": "Dates open in 2027 and 2028",
    "cta": "Check your date",
    "storiesLink": "See the stories"
  },
  "promises": {
    "heading": "What I promise",
    "items": [
      {
        "title": "I stay out of the way.",
        "line": "By the first hour you stop noticing me. That's when the good photographs start."
      },
      {
        "title": "You won't need to pose.",
        "line": "I give a direction when it helps, then I leave you to each other."
      },
      {
        "title": "You see the photos quickly.",
        "line": "A first selection three days after the wedding, while you still remember every detail."
      }
    ],
    "coverage": "About eight photographs in ten are taken as they happen, with no posing."
  },
  "day": {
    "titleBase": "Your day,",
    "titleAccent": "hour by hour",
    "intro": "From the first coffee to the last song, this is what I photograph, and when.",
    "parts": {
      "morning": "in the morning",
      "afternoon": "in the afternoon",
      "evening": "in the evening",
      "night": "at night"
    },
    "moments": {
      "getting-ready": {
        "title": "Getting ready",
        "line": "Buttons, hairspray, and a parent who keeps checking the time."
      },
      "first-look": {
        "title": "The first look",
        "line": "Some couples want it alone, some in front of everyone. Both work."
      },
      "ceremony": {
        "title": "The ceremony",
        "line": "I stay at the back during the vows and only move between them."
      },
      "family": {
        "title": "Family photos",
        "line": "A list you give me ahead of time, done in about twenty minutes."
      },
      "portraits": {
        "title": "The two of you",
        "line": "A short walk away from the guests. Most couples say it was the calmest part of their day."
      },
      "golden-hour": {
        "title": "Golden hour",
        "line": "Ten minutes outside while the light is low. Worth leaving dessert for."
      },
      "speeches": {
        "title": "Speeches",
        "line": "I watch the people listening as much as the person speaking."
      },
      "last-dance": {
        "title": "The last dance",
        "line": "Flash on, shoes off. I stay until the floor empties or you send me home."
      }
    }
  },
  "stories": {
    "titleBase": "Weddings,",
    "titleAccent": "as they happened",
    "intro": "Each wedding from its first hour to its last, in the order it happened.",
    "all": "All stories",
    "filters": {
      "all": "All",
      "elopement": "Elopements",
      "intimate": "Intimate weddings",
      "full_day": "Full days"
    },
    "types": {
      "elopement": "Elopement",
      "intimate": "Intimate wedding",
      "full_day": "Full day"
    },
    "photographs": "{count, plural, one {# photograph} other {# photographs}}",
    "seasons": {
      "spring": "Spring",
      "summer": "Summer",
      "autumn": "Autumn",
      "winter": "Winter"
    },
    "seasonYear": "{season} {year}",
    "empty": "The first stories are on their way.",
    "notFound": "This story isn't here. It may have moved.",
    "back": "All stories",
    "next": "Next story",
    "lightbox": {
      "open": "Open photograph {n}",
      "close": "Close",
      "previous": "Previous photograph",
      "next": "Next photograph",
      "counter": "{current} of {total}"
    }
  },
  "about": {
    "titleBase": "I'm Lili,",
    "titleAccent": "and I'll be nearby",
    "body": [
      "I photograph weddings the way I photograph everything else: close enough to see, far enough to stay out of it. Most of my work is people, in Montréal and wherever they take me.",
      "On your day I arrive early and stay quiet. I'd rather you remember your guests than my camera."
    ],
    "link": "See the rest of my work on lilispics.com"
  },
  "words": {
    "titleBase": "In their",
    "titleAccent": "own words",
    "previous": "Previous",
    "next": "Next",
    "items": []
  },
  "process": {
    "titleBase": "From first email",
    "titleAccent": "to the album",
    "cardHeading": "Order of service",
    "steps": [
      {
        "when": "Today",
        "what": "You write to me",
        "why": "A few lines about your day are enough. The reply card below takes a minute."
      },
      {
        "when": "Within 48 hours",
        "what": "A 30-minute call",
        "why": "We talk about the day you have in mind, and you see whether we get along."
      },
      {
        "when": "When you're ready",
        "what": "You reserve your date",
        "why": "A short contract and a retainer. From then on, the date is yours."
      },
      {
        "when": "In the months before",
        "what": "We plan together",
        "why": "The timeline, the family list, and the places worth a detour."
      },
      {
        "when": "On the day",
        "what": "I'm there",
        "why": "For the hours of your collection, from the first coffee onward."
      },
      {
        "when": "Three days later",
        "what": "A first selection",
        "why": "A handful of photographs, so you're not left waiting with nothing."
      },
      {
        "when": "About six weeks later",
        "what": "Your full gallery",
        "why": "Online, to download and share. Then the album, if you chose one."
      }
    ]
  },
  "collections": {
    "titleBase": "Three ways",
    "titleAccent": "to have me there",
    "from": "from",
    "onRequest": "On request",
    "items": {
      "elopement": {
        "name": "Elopement",
        "duration": "Up to 3 hours",
        "includes": [
          "The two of you and a few guests",
          "Ceremony and portraits",
          "Online gallery"
        ]
      },
      "intimate": {
        "name": "Intimate",
        "duration": "Up to 6 hours",
        "includes": [
          "Up to 60 guests",
          "Ceremony, family photos and portraits",
          "First selection and online gallery"
        ]
      },
      "full_day": {
        "name": "Full day",
        "duration": "About 10 hours",
        "includes": [
          "From getting ready to the first dances",
          "Second photographer available",
          "First selection and online gallery"
        ]
      }
    },
    "addons": "You can add a second photographer, an engagement session, a printed album, or a roll of 35 mm film."
  },
  "questions": {
    "titleBase": "Questions",
    "titleAccent": "couples ask",
    "groups": [
      {
        "title": "Style and approach",
        "items": [
          {
            "q": "Do we need to know how to pose?",
            "a": "No. Most of the day I photograph what happens without stepping in. For the portraits I give simple directions, like where to walk or where to look, and then I let you be together."
          },
          {
            "q": "Do you do family group photos?",
            "a": "Yes. You send me a list before the wedding, and someone who knows the family helps me call people in. It usually takes about twenty minutes."
          },
          {
            "q": "Do you work with a second photographer?",
            "a": "For full days I can bring a second photographer I trust, so both sides of the morning are covered. It's an add-on to the collection."
          },
          {
            "q": "Do you shoot film?",
            "a": "I can shoot a roll or two of 35 mm film alongside the digital photographs. The scans arrive with your gallery."
          }
        ]
      },
      {
        "title": "Booking and travel",
        "items": [
          {
            "q": "How do we reserve our date?",
            "a": "After our call I send a short contract and an invoice for the retainer. Your date is reserved once both are back."
          },
          {
            "q": "Is there a retainer or a payment plan?",
            "a": "A retainer reserves the date, and the balance is due before the wedding. If you need to spread it out, tell me and we'll find a schedule."
          },
          {
            "q": "Do you travel outside Montréal?",
            "a": "Yes, anywhere in Québec and beyond. Travel costs are added to the quote, and you know the amount before you reserve."
          },
          {
            "q": "How many weddings do you take each year?",
            "a": "A limited number, so each couple gets my full attention before and after the day."
          }
        ]
      },
      {
        "title": "On the day",
        "items": [
          {
            "q": "What if it rains?",
            "a": "We bring umbrellas and find a covered spot with good light. Some of my favourite photographs were taken in the rain."
          },
          {
            "q": "Can you work in dark venues?",
            "a": "Yes. I use flash when the room is dark, and I keep it soft so it doesn't interrupt the evening."
          },
          {
            "q": "Do you need a meal and a break?",
            "a": "For days longer than six hours, a meal during dinner is appreciated. I eat when the guests eat, so I never miss the speeches."
          }
        ]
      },
      {
        "title": "After the wedding",
        "items": [
          {
            "q": "When do we see the photos?",
            "a": "A first selection three days after the wedding, and the full gallery about six weeks later."
          },
          {
            "q": "Do you make albums?",
            "a": "Yes. We design the album together once the gallery is delivered, and a bindery I trust prints it."
          },
          {
            "q": "Can we ask you not to share our photographs?",
            "a": "Of course. Tell me before the wedding or at any time after, and your photographs stay private."
          }
        ]
      }
    ]
  },
  "reply": {
    "titleBase": "Tell me",
    "titleAccent": "about your day",
    "intro": "Tell me where and when, even roughly. I reply within 48 hours with my availability and a first idea of the price.",
    "introAside": "You can also write to me at {email}.",
    "cardHeading": "Kindly reply",
    "cardNote": "About a minute to fill in.",
    "fields": {
      "names": "Your names",
      "email": "Email",
      "date": "Wedding date",
      "dateUnset": "We haven't set a date yet",
      "venue": "Venue or city",
      "guests": "Guests",
      "collection": "Collection",
      "budget": "Photography budget",
      "heard": "How did you hear about me?",
      "message": "Anything else you'd like me to know",
      "consent": "I agree that Lili keeps these details to answer me, as described in the <link>privacy policy</link>.",
      "choose": "Choose"
    },
    "options": {
      "guests": {
        "under_20": "Fewer than 20",
        "20_60": "20 to 60",
        "60_120": "60 to 120",
        "over_120": "More than 120"
      },
      "collection": {
        "elopement": "Elopement",
        "intimate": "Intimate",
        "full_day": "Full day",
        "unsure": "Not sure yet"
      },
      "budget": {
        "under_3000": "Under $3,000",
        "3000_4500": "$3,000 to $4,500",
        "4500_6000": "$4,500 to $6,000",
        "over_6000": "More than $6,000",
        "unsure": "I'd rather talk about it"
      }
    },
    "errors": {
      "required": "Please fill this in.",
      "email": "This email address doesn't look right.",
      "date": "Choose a date, or tick the box below it.",
      "consent": "Please accept so I can keep your details.",
      "server": "Something went wrong on my side. Your answers are still here, so you can try again, or write to hello@lilispics.com."
    },
    "submit": "Seal and send",
    "sending": "Sealing",
    "success": {
      "title": "Sealed and sent",
      "message": "Thank you. I'll write back within 48 hours, often sooner.",
      "reset": "Write another reply"
    }
  },
  "privacy": {
    "title": "Privacy policy",
    "updated": "Last updated: {date}",
    "intro": "This page explains what happens to the details you send me through this site, in line with Québec's Act respecting the protection of personal information in the private sector (Law 25).",
    "sections": [
      {
        "heading": "Who is responsible",
        "body": [
          "I'm Lili, the photographer behind Lilis Pics, and I'm the person responsible for protecting your personal information. You can reach me at hello@lilispics.com."
        ]
      },
      {
        "heading": "What I collect",
        "body": [
          "When you send the reply card: your names, email address, wedding date, venue or city, number of guests, collection, budget range, how you heard about me, and your message.",
          "This site does not use advertising cookies or trackers."
        ]
      },
      {
        "heading": "Why",
        "body": [
          "Only to answer your request, prepare a quote and, if you book, organise the photography of your wedding. I never sell or share your details for marketing."
        ]
      },
      {
        "heading": "Where it is kept",
        "body": [
          "Your details are stored with Supabase, my database provider, and the notification email goes through Resend. These providers may keep data outside Québec. [HOSTING REGION TO CONFIRM]"
        ]
      },
      {
        "heading": "How long",
        "body": [
          "I keep a request for [RETENTION PERIOD TO CONFIRM] after our last exchange, then delete it. If you book, your details become part of your contract file."
        ]
      },
      {
        "heading": "Your rights",
        "body": [
          "You can ask to see, correct or delete your information, or withdraw your consent, at any time by writing to hello@lilispics.com. I answer within 30 days.",
          "If you are not satisfied with my answer, you can contact the Commission d'accès à l'information du Québec."
        ]
      }
    ]
  },
  "footer": {
    "titleBase": "Your date might",
    "titleAccent": "still be free",
    "cta": "Check your date",
    "availability": "Dates open in 2027 and 2028",
    "instagram": "Instagram",
    "portfolio": "lilispics.com",
    "privacy": "Privacy",
    "copyright": "© {year} Lilis Pics. Photographs by Lili."
  }
}
```

## 4. `apps/wedding/messages/fr.json`

```json
{
  "meta": {
    "title": "Lilis Pics · Mariages",
    "description": "Photographe de mariage à Montréal et partout au Québec. Lili photographie votre journée sur le vif, du matin à la dernière danse.",
    "storiesTitle": "Histoires de mariage",
    "storiesDescription": "Des journées de mariage complètes photographiées par Lili, de la première à la dernière heure.",
    "rsvpTitle": "Vérifier votre date",
    "rsvpDescription": "Parlez de votre mariage à Lili. Ça prend environ une minute.",
    "privacyTitle": "Politique de confidentialité",
    "privacyDescription": "Comment Lili traite les renseignements que vous envoyez par ce site."
  },
  "nav": {
    "menu": "Menu",
    "close": "Fermer",
    "email": "hello@lilispics.com",
    "logoAlt": "Lilis Pics, mariages, accueil",
    "skip": "Aller au contenu",
    "localeLabel": "Langue",
    "items": {
      "stories": "Histoires",
      "day": "Votre journée",
      "collections": "Collections",
      "questions": "Questions",
      "reply": "Vérifier votre date",
      "portfolio": "Portfolio"
    }
  },
  "hero": {
    "host": "Lili, photographe",
    "lead": "a le plaisir de vous inviter",
    "title": "à **simplement** être là",
    "lead2": "le jour de votre mariage,",
    "place": "à Montréal, ailleurs au Québec, ou là où vous direz oui.",
    "reassurance": "Pas besoin de savoir poser : je reste près de vous, discrète, et je garde la journée telle que vous l'avez vécue.",
    "availability": "Dates libres en 2027 et 2028",
    "cta": "Vérifier votre date",
    "storiesLink": "Voir les histoires"
  },
  "promises": {
    "heading": "Ce que je vous promets",
    "items": [
      {
        "title": "Je me fais oublier.",
        "line": "Dès la première heure, vous ne me remarquez plus. C'est là que les bonnes photos commencent."
      },
      {
        "title": "Pas besoin de poser.",
        "line": "Je vous guide quand ça aide, puis je vous laisse l'un à l'autre."
      },
      {
        "title": "Vous voyez les photos rapidement.",
        "line": "Une première sélection trois jours après le mariage, quand vous vous souvenez encore de tout."
      }
    ],
    "coverage": "Environ huit photos sur dix sont prises sur le vif, sans pose."
  },
  "day": {
    "titleBase": "Votre journée,",
    "titleAccent": "heure par heure",
    "intro": "Du premier café à la dernière chanson, voici ce que je photographie, et à quel moment.",
    "parts": {
      "morning": "le matin",
      "afternoon": "l'après-midi",
      "evening": "en soirée",
      "night": "dans la nuit"
    },
    "moments": {
      "getting-ready": {
        "title": "Les préparatifs",
        "line": "Des boutons, de la laque, et un parent qui regarde l'heure sans arrêt."
      },
      "first-look": {
        "title": "Le premier regard",
        "line": "Certains couples le veulent seuls, d'autres devant tout le monde. Les deux fonctionnent."
      },
      "ceremony": {
        "title": "La cérémonie",
        "line": "Je reste au fond pendant les vœux et je ne bouge qu'entre deux."
      },
      "family": {
        "title": "Les photos de famille",
        "line": "Une liste que vous me donnez d'avance, et c'est fait en une vingtaine de minutes."
      },
      "portraits": {
        "title": "Vous deux",
        "line": "Une courte marche, loin des invités. La plupart des couples disent que c'était le moment le plus calme de leur journée."
      },
      "golden-hour": {
        "title": "L'heure dorée",
        "line": "Dix minutes dehors pendant que la lumière est basse. Ça vaut la peine de laisser le dessert."
      },
      "speeches": {
        "title": "Les discours",
        "line": "Je regarde ceux qui écoutent autant que celui qui parle."
      },
      "last-dance": {
        "title": "La dernière danse",
        "line": "Flash allumé, souliers enlevés. Je reste jusqu'à ce que la piste se vide ou que vous me renvoyiez chez moi."
      }
    }
  },
  "stories": {
    "titleBase": "Des mariages,",
    "titleAccent": "tels qu'ils ont eu lieu",
    "intro": "Chaque mariage de sa première à sa dernière heure, dans l'ordre où il s'est déroulé.",
    "all": "Toutes les histoires",
    "filters": {
      "all": "Toutes",
      "elopement": "Élopements",
      "intimate": "Mariages intimes",
      "full_day": "Journées complètes"
    },
    "types": {
      "elopement": "Élopement",
      "intimate": "Mariage intime",
      "full_day": "Journée complète"
    },
    "photographs": "{count, plural, one {# photo} other {# photos}}",
    "seasons": {
      "spring": "Printemps",
      "summer": "Été",
      "autumn": "Automne",
      "winter": "Hiver"
    },
    "seasonYear": "{season} {year}",
    "empty": "Les premières histoires arrivent bientôt.",
    "notFound": "Cette histoire n'est pas ici. Elle a peut-être été déplacée.",
    "back": "Toutes les histoires",
    "next": "Histoire suivante",
    "lightbox": {
      "open": "Ouvrir la photo {n}",
      "close": "Fermer",
      "previous": "Photo précédente",
      "next": "Photo suivante",
      "counter": "{current} sur {total}"
    }
  },
  "about": {
    "titleBase": "Je suis Lili,",
    "titleAccent": "et je reste tout près",
    "body": [
      "Je photographie les mariages comme tout le reste : assez près pour voir, assez loin pour ne rien déranger. Je photographie surtout des gens, à Montréal et partout où ils m'emmènent.",
      "Le jour venu, j'arrive tôt et je reste discrète. Je préfère que vous vous souveniez de vos invités plutôt que de mon appareil."
    ],
    "link": "Voir le reste de mon travail sur lilispics.com"
  },
  "words": {
    "titleBase": "Dans leurs",
    "titleAccent": "propres mots",
    "previous": "Précédent",
    "next": "Suivant",
    "items": []
  },
  "process": {
    "titleBase": "Du premier courriel",
    "titleAccent": "jusqu'à l'album",
    "cardHeading": "Déroulement",
    "steps": [
      {
        "when": "Aujourd'hui",
        "what": "Vous m'écrivez",
        "why": "Quelques lignes sur votre journée suffisent. La carte-réponse plus bas prend une minute."
      },
      {
        "when": "D'ici 48 heures",
        "what": "Un appel de 30 minutes",
        "why": "On parle de la journée que vous imaginez, et vous voyez si le courant passe."
      },
      {
        "when": "Quand vous êtes prêts",
        "what": "Vous réservez votre date",
        "why": "Un court contrat et un acompte. À partir de là, la date est à vous."
      },
      {
        "when": "Dans les mois qui précèdent",
        "what": "On planifie ensemble",
        "why": "L'horaire, la liste de famille, et les endroits qui valent un détour."
      },
      {
        "when": "Le jour venu",
        "what": "Je suis là",
        "why": "Pour les heures de votre collection, dès le premier café."
      },
      {
        "when": "Trois jours plus tard",
        "what": "Une première sélection",
        "why": "Quelques photos, pour ne pas attendre les mains vides."
      },
      {
        "when": "Environ six semaines plus tard",
        "what": "Votre galerie complète",
        "why": "En ligne, à télécharger et à partager. Puis l'album, si vous en avez choisi un."
      }
    ]
  },
  "collections": {
    "titleBase": "Trois façons",
    "titleAccent": "de m'avoir à vos côtés",
    "from": "à partir de",
    "onRequest": "Sur demande",
    "items": {
      "elopement": {
        "name": "Élopement",
        "duration": "Jusqu'à 3 heures",
        "includes": [
          "Vous deux et quelques invités",
          "Cérémonie et portraits",
          "Galerie en ligne"
        ]
      },
      "intimate": {
        "name": "Intime",
        "duration": "Jusqu'à 6 heures",
        "includes": [
          "Jusqu'à 60 invités",
          "Cérémonie, photos de famille et portraits",
          "Première sélection et galerie en ligne"
        ]
      },
      "full_day": {
        "name": "Journée complète",
        "duration": "Environ 10 heures",
        "includes": [
          "Des préparatifs aux premières danses",
          "Deuxième photographe offert en option",
          "Première sélection et galerie en ligne"
        ]
      }
    },
    "addons": "Vous pouvez ajouter un deuxième photographe, une séance d'engagement, un album imprimé ou un rouleau de film 35 mm."
  },
  "questions": {
    "titleBase": "Les questions",
    "titleAccent": "que posent les couples",
    "groups": [
      {
        "title": "Style et approche",
        "items": [
          {
            "q": "Faut-il savoir poser ?",
            "a": "Non. La plupart du temps, je photographie ce qui se passe sans intervenir. Pour les portraits, je donne des indications simples, comme où marcher ou où regarder, puis je vous laisse être ensemble."
          },
          {
            "q": "Faites-vous les photos de groupe avec la famille ?",
            "a": "Oui. Vous m'envoyez une liste avant le mariage, et une personne qui connaît la famille m'aide à appeler les gens. Ça prend habituellement une vingtaine de minutes."
          },
          {
            "q": "Travaillez-vous avec un deuxième photographe ?",
            "a": "Pour les journées complètes, je peux venir avec un deuxième photographe en qui j'ai confiance, pour couvrir les deux côtés des préparatifs. C'est une option qui s'ajoute à la collection."
          },
          {
            "q": "Photographiez-vous en argentique ?",
            "a": "Je peux faire un ou deux rouleaux de film 35 mm en plus des photos numériques. Les numérisations arrivent avec votre galerie."
          }
        ]
      },
      {
        "title": "Réservation et déplacements",
        "items": [
          {
            "q": "Comment réserver notre date ?",
            "a": "Après notre appel, je vous envoie un court contrat et une facture pour l'acompte. Votre date est réservée dès que les deux me sont revenus."
          },
          {
            "q": "Y a-t-il un acompte ou un plan de paiement ?",
            "a": "Un acompte réserve la date, et le solde est payable avant le mariage. Si vous avez besoin d'étaler les paiements, dites-le-moi et on trouvera un calendrier."
          },
          {
            "q": "Vous déplacez-vous hors de Montréal ?",
            "a": "Oui, partout au Québec et ailleurs. Les frais de déplacement s'ajoutent au devis, et vous connaissez le montant avant de réserver."
          },
          {
            "q": "Combien de mariages acceptez-vous par année ?",
            "a": "Un nombre limité, pour que chaque couple ait toute mon attention avant et après la journée."
          }
        ]
      },
      {
        "title": "Le jour du mariage",
        "items": [
          {
            "q": "Et s'il pleut ?",
            "a": "On apporte des parapluies et on trouve un endroit couvert avec une belle lumière. Certaines de mes photos préférées ont été prises sous la pluie."
          },
          {
            "q": "Pouvez-vous travailler dans des salles sombres ?",
            "a": "Oui. J'utilise le flash quand la salle est sombre, et je le garde doux pour ne pas déranger la soirée."
          },
          {
            "q": "Avez-vous besoin d'un repas et d'une pause ?",
            "a": "Pour les journées de plus de six heures, un repas pendant le souper est apprécié. Je mange en même temps que les invités, pour ne jamais manquer les discours."
          }
        ]
      },
      {
        "title": "Après le mariage",
        "items": [
          {
            "q": "Quand voit-on les photos ?",
            "a": "Une première sélection trois jours après le mariage, et la galerie complète environ six semaines plus tard."
          },
          {
            "q": "Faites-vous des albums ?",
            "a": "Oui. On conçoit l'album ensemble une fois la galerie livrée, et un relieur en qui j'ai confiance l'imprime."
          },
          {
            "q": "Peut-on vous demander de ne pas partager nos photos ?",
            "a": "Bien sûr. Dites-le-moi avant le mariage ou n'importe quand après, et vos photos restent privées."
          }
        ]
      }
    ]
  },
  "reply": {
    "titleBase": "Parlez-moi",
    "titleAccent": "de votre journée",
    "intro": "Dites-moi où et quand, même approximativement. Je vous réponds d'ici 48 heures avec mes disponibilités et une première idée du prix.",
    "introAside": "Vous pouvez aussi m'écrire à {email}.",
    "cardHeading": "Réponse souhaitée",
    "cardNote": "Environ une minute à remplir.",
    "fields": {
      "names": "Vos noms",
      "email": "Courriel",
      "date": "Date du mariage",
      "dateUnset": "Nous n'avons pas encore de date",
      "venue": "Lieu ou ville",
      "guests": "Invités",
      "collection": "Collection",
      "budget": "Budget photo",
      "heard": "Comment m'avez-vous trouvée ?",
      "message": "Ce que vous aimeriez que je sache",
      "consent": "J'accepte que Lili conserve ces renseignements pour me répondre, comme l'explique la <link>politique de confidentialité</link>.",
      "choose": "Choisir"
    },
    "options": {
      "guests": {
        "under_20": "Moins de 20",
        "20_60": "De 20 à 60",
        "60_120": "De 60 à 120",
        "over_120": "Plus de 120"
      },
      "collection": {
        "elopement": "Élopement",
        "intimate": "Intime",
        "full_day": "Journée complète",
        "unsure": "Nous ne savons pas encore"
      },
      "budget": {
        "under_3000": "Moins de 3 000 $",
        "3000_4500": "De 3 000 $ à 4 500 $",
        "4500_6000": "De 4 500 $ à 6 000 $",
        "over_6000": "Plus de 6 000 $",
        "unsure": "J'aimerais en discuter"
      }
    },
    "errors": {
      "required": "Veuillez remplir ce champ.",
      "email": "Cette adresse courriel ne semble pas valide.",
      "date": "Choisissez une date, ou cochez la case en dessous.",
      "consent": "Veuillez accepter pour que je puisse conserver vos renseignements.",
      "server": "Un problème est survenu de mon côté. Vos réponses sont toujours là : vous pouvez réessayer, ou m'écrire à hello@lilispics.com."
    },
    "submit": "Sceller et envoyer",
    "sending": "Scellage en cours",
    "success": {
      "title": "Scellée et envoyée",
      "message": "Merci. Je vous réponds d'ici 48 heures, souvent avant.",
      "reset": "Écrire une autre réponse"
    }
  },
  "privacy": {
    "title": "Politique de confidentialité",
    "updated": "Dernière mise à jour : {date}",
    "intro": "Cette page explique ce qu'il advient des renseignements que vous m'envoyez par ce site, conformément à la Loi sur la protection des renseignements personnels dans le secteur privé du Québec (Loi 25).",
    "sections": [
      {
        "heading": "La personne responsable",
        "body": [
          "Je suis Lili, la photographe derrière Lilis Pics, et je suis la personne responsable de la protection de vos renseignements personnels. Vous pouvez me joindre à hello@lilispics.com."
        ]
      },
      {
        "heading": "Ce que je recueille",
        "body": [
          "Quand vous envoyez la carte-réponse : vos noms, votre adresse courriel, la date du mariage, le lieu ou la ville, le nombre d'invités, la collection, la fourchette de budget, la façon dont vous m'avez trouvée et votre message.",
          "Ce site n'utilise ni témoins publicitaires ni outils de suivi."
        ]
      },
      {
        "heading": "Pourquoi",
        "body": [
          "Uniquement pour répondre à votre demande, préparer un devis et, si vous réservez, organiser la photographie de votre mariage. Je ne vends ni ne partage jamais vos renseignements à des fins de marketing."
        ]
      },
      {
        "heading": "Où ils sont conservés",
        "body": [
          "Vos renseignements sont conservés chez Supabase, mon fournisseur de base de données, et le courriel d'avis passe par Resend. Ces fournisseurs peuvent conserver des données à l'extérieur du Québec. [RÉGION D'HÉBERGEMENT À CONFIRMER]"
        ]
      },
      {
        "heading": "Combien de temps",
        "body": [
          "Je conserve une demande pendant [DURÉE DE CONSERVATION À CONFIRMER] après notre dernier échange, puis je la supprime. Si vous réservez, vos renseignements font partie de votre dossier de contrat."
        ]
      },
      {
        "heading": "Vos droits",
        "body": [
          "Vous pouvez demander à consulter, corriger ou supprimer vos renseignements, ou retirer votre consentement, en tout temps en écrivant à hello@lilispics.com. Je réponds dans un délai de 30 jours.",
          "Si ma réponse ne vous satisfait pas, vous pouvez vous adresser à la Commission d'accès à l'information du Québec."
        ]
      }
    ]
  },
  "footer": {
    "titleBase": "Votre date est peut-être",
    "titleAccent": "encore libre",
    "cta": "Vérifier votre date",
    "availability": "Dates libres en 2027 et 2028",
    "instagram": "Instagram",
    "portfolio": "lilispics.com",
    "privacy": "Confidentialité",
    "copyright": "© {year} Lilis Pics. Photos de Lili."
  }
}
```

## 5. Non-message copy

| Where | Text | Notes |
| --- | --- | --- |
| Alt text of placeholder photos | Written by the agent in phase 05, after looking at each image | Describe what is visible, in both languages, stored in `src/data/placeholder-photos.ts` |
| Notification email subject | `New wedding inquiry from {names}, Lilis Pics` | English only (it goes to Lili) |
| Notification email footer | `Sent from the reply card at wedding.lilispics.com` | |
| Admin inbox (English only) | Page title "Wedding inquiries"; empty state "No wedding inquiries yet. Reply cards sent from wedding.lilispics.com land here." | |
| Dev testimonial sample | Lives in `src/data/words.dev.ts`, rendered only in development | Lines must read `DEV SAMPLE` in the names field so a leak is obvious |

## 6. Facts to confirm with Lili

The agent must not change these. The operator replaces them once Lili answers. The site stays noindex until then.

| Key | Statement |
| --- | --- |
| `hero.availability`, `footer.availability` | Dates open in 2027 and 2028 |
| `promises.items[2]`, `process.steps[5]`, `questions…When do we see the photos` | First selection three days after the wedding |
| `process.steps[6]`, same FAQ | Full gallery about six weeks later |
| `process.steps[1]`, `reply.intro`, `reply.success.message` | Reply within 48 hours; 30-minute call |
| `process.steps[2]`, FAQ booking answers | Contract and retainer; balance due before the wedding; payment plan possible |
| `day.moments.family`, FAQ family answer | About twenty minutes for family photos |
| `collections.items.*` | Durations (3 h, 6 h, about 10 h), "up to 60 guests", inclusions |
| `collections.addons`, FAQ second photographer and film answers | Second photographer, engagement session, album, 35 mm film are offered |
| FAQ travel answer | Travels anywhere in Québec and beyond; travel costs quoted in advance |
| FAQ meal answer | Meal expected for days over six hours |
| FAQ albums answer | Albums printed by a bindery |
| `reply.options.budget` | Budget ranges (in CAD) |
| `privacy.sections` | `[HOSTING REGION TO CONFIRM]` and `[RETENTION PERIOD TO CONFIRM]` placeholders; no analytics on the wedding site |
| `nav.email` | `hello@lilispics.com` is the address couples should use |
