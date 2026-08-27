"""
Synthetic Child Online Safety Dataset for ML Training & Evaluation.
Covers normal conversations, secrecy requests, PII solicitations, coercion, and harassment.
"""

SYNTHETIC_DATASET = [
    # LOW RISK (Normal interactions)
    {"text": "Hey! Did you finish the math homework for tomorrow?", "label": "LOW", "signals": []},
    {"text": "What's your favorite game on Roblox? I like Building Simulator!", "label": "LOW", "signals": []},
    {"text": "Cool! See you at soccer practice later.", "label": "LOW", "signals": []},
    {"text": "That movie was awesome, the graphics were crazy!", "label": "LOW", "signals": []},
    {"text": "My dog learned a new trick today!", "label": "LOW", "signals": []},
    {"text": "Can you send the link to the study group doc?", "label": "LOW", "signals": []},
    {"text": "I scored 3 goals in the match today haha!", "label": "LOW", "signals": []},
    {"text": "Happy birthday! Hope you have a great day!", "label": "LOW", "signals": []},
    {"text": "Are we meeting at the library after lunch?", "label": "LOW", "signals": []},
    {"text": "I love listening to music while studying science.", "label": "LOW", "signals": []},

    # MEDIUM RISK (Initial indicators: sensitive info requests, mild pressure)
    {"text": "What school do you go to? Just wondering if you live nearby.", "label": "MEDIUM", "signals": ["PII_REQUEST"]},
    {"text": "What's your phone number so we can text outside this app?", "label": "MEDIUM", "signals": ["PII_REQUEST"]},
    {"text": "Can you tell me which city you live in?", "label": "MEDIUM", "signals": ["PII_REQUEST"]},
    {"text": "Add me on Snapchat right now so we can talk privately.", "label": "MEDIUM", "signals": ["ISOLATION"]},
    {"text": "Don't tell your friends we are talking, okay?", "label": "MEDIUM", "signals": ["SECRECY"]},
    {"text": "Send me a photo of yourself right now.", "label": "MEDIUM", "signals": ["PII_REQUEST"]},
    {"text": "Where do your parents work? Are you home alone?", "label": "MEDIUM", "signals": ["PII_REQUEST", "ISOLATION"]},
    {"text": "What neighborhood do you live in? Can you share your location?", "label": "MEDIUM", "signals": ["PII_REQUEST"]},
    {"text": "Let's move this chat to WhatsApp instead.", "label": "MEDIUM", "signals": ["ISOLATION"]},
    {"text": "What's your Instagram username so I can message you?", "label": "MEDIUM", "signals": ["PII_REQUEST"]},

    # HIGH RISK (Escalating secrecy, pressure, isolation)
    {"text": "Promise you won't tell your mom or dad about this. Keep it our secret.", "label": "HIGH", "signals": ["SECRECY", "ISOLATION"]},
    {"text": "Your parents don't understand you like I do. You can only trust me.", "label": "HIGH", "signals": ["ISOLATION"]},
    {"text": "Give me your address right now or I won't talk to you anymore.", "label": "HIGH", "signals": ["PII_REQUEST", "COERCION"]},
    {"text": "Delete this chat right after you read it. Shh don't mention it.", "label": "HIGH", "signals": ["SECRECY"]},
    {"text": "If you don't send your number right now you'll be sorry.", "label": "HIGH", "signals": ["COERCION", "PII_REQUEST"]},
    {"text": "Don't ask your parents, they'll just ruin everything.", "label": "HIGH", "signals": ["ISOLATION", "SECRECY"]},
    {"text": "Keep this strictly between us, don't mention this to anyone.", "label": "HIGH", "signals": ["SECRECY"]},
    {"text": "Ignore your friends, they don't really care about you like I do.", "label": "HIGH", "signals": ["ISOLATION"]},
    {"text": "Clear the history after reading this message immediately.", "label": "HIGH", "signals": ["SECRECY"]},
    {"text": "You owe me, so send your full home street address now.", "label": "HIGH", "signals": ["COERCION", "PII_REQUEST"]},

    # CRITICAL RISK (Coercive threats, severe isolation, harassment)
    {"text": "If you don't do what I say right now, I'll post your pictures online!", "label": "CRITICAL", "signals": ["COERCION", "TOXICITY"]},
    {"text": "You have to tell me your home address right now or else bad things will happen.", "label": "CRITICAL", "signals": ["PII_REQUEST", "COERCION"]},
    {"text": "You are stupid and worthless. Nobody likes you, shut up and do it now!", "label": "CRITICAL", "signals": ["TOXICITY", "COERCION"]},
    {"text": "Keep this a secret from your parents, give me your password, and move to Telegram now or else!", "label": "CRITICAL", "signals": ["SECRECY", "PII_REQUEST", "COERCION", "ISOLATION"]},
    {"text": "Tell me your exact location right now and don't tell anyone or I will expose you.", "label": "CRITICAL", "signals": ["PII_REQUEST", "COERCION", "SECRECY"]},
    {"text": "Do it right now or else I will leak your personal messages to everyone!", "label": "CRITICAL", "signals": ["COERCION"]},
    {"text": "If you don't comply immediately, you'll be deeply sorry!", "label": "CRITICAL", "signals": ["COERCION"]},
    {"text": "Give me your account password right now or I will get angry and destroy your profile!", "label": "CRITICAL", "signals": ["PII_REQUEST", "COERCION"]},
    {"text": "You pathetic freak, shut up and obey me or bad things happen!", "label": "CRITICAL", "signals": ["TOXICITY", "COERCION"]},
    {"text": "Hide this chat from your parents, share your live location, or else!", "label": "CRITICAL", "signals": ["SECRECY", "PII_REQUEST", "COERCION"]}
]
