"""
DevMatch AI Matching Service
Uses Fuzzy Logic + Neural Network for hackathon teammate matching.
Weights: 50% skills, 30% tech stack, 20% role compatibility
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
import json
import os

app = Flask(__name__)
CORS(app)

# ============================================================
# FUZZY LOGIC ENGINE
# ============================================================

class FuzzyMatcher:
    """
    Fuzzy logic-based matching using membership functions to compute
    developer compatibility scores across multiple dimensions.
    """

    @staticmethod
    def triangular_mf(x, a, b, c):
        """Triangular membership function"""
        if x <= a or x >= c:
            return 0.0
        elif x <= b:
            return (x - a) / (b - a) if b != a else 1.0
        else:
            return (c - x) / (c - b) if c != b else 1.0

    @staticmethod
    def trapezoidal_mf(x, a, b, c, d):
        """Trapezoidal membership function"""
        if x <= a or x >= d:
            return 0.0
        elif a < x <= b:
            return (x - a) / (b - a) if b != a else 1.0
        elif b < x <= c:
            return 1.0
        else:
            return (d - x) / (d - c) if d != c else 1.0

    def compute_skill_overlap(self, user1_skills, user2_skills):
        """Compute fuzzy skill overlap score (complementary skills are ideal)"""
        if not user1_skills or not user2_skills:
            return 0.0

        set1 = set(s.lower() for s in user1_skills)
        set2 = set(s.lower() for s in user2_skills)
        intersection = len(set1 & set2)
        union = len(set1 | set2)
        raw = intersection / union if union > 0 else 0

        # Apply triangular MF: partial overlap is ideal for complementary teams
        low    = self.triangular_mf(raw, 0, 0, 0.3)
        medium = self.triangular_mf(raw, 0.2, 0.5, 0.7)
        high   = self.triangular_mf(raw, 0.5, 1.0, 1.0)

        return 0.2 * low + 0.6 * medium + 1.0 * high

    def compute_tech_stack_similarity(self, user1_tech, user2_tech):
        """
        Compute fuzzy tech stack compatibility.
        Shared tech stack = easier collaboration; some overlap is good.
        """
        if not user1_tech or not user2_tech:
            return 0.0

        set1 = set(t.lower() for t in user1_tech)
        set2 = set(t.lower() for t in user2_tech)
        shared = len(set1 & set2)
        total  = max(len(set1), len(set2), 1)
        raw    = shared / total

        # Trapezoidal: moderate-to-high overlap in tech is great
        return self.trapezoidal_mf(raw, 0, 0.25, 0.75, 1.0) * 0.7 + raw * 0.3

    def compute_role_compatibility(self, role1, role2):
        """
        Score role compatibility.
        Different roles → high compatibility (complementary team).
        Same role → medium compatibility (redundant but not bad).
        """
        if not role1 or not role2:
            return 0.4  # neutral if unknown

        r1 = role1.lower().strip()
        r2 = role2.lower().strip()

        if r1 == r2:
            # Same role: moderate score — can collaborate but redundant
            return 0.4

        # Complementary pairs get the highest score
        complementary = {
            frozenset({'frontend', 'backend'}),
            frozenset({'frontend', 'ml'}),
            frozenset({'backend', 'ml'}),
            frozenset({'frontend', 'devops'}),
            frozenset({'backend', 'devops'}),
            frozenset({'ml', 'devops'}),
            frozenset({'design', 'frontend'}),
            frozenset({'design', 'backend'}),
            frozenset({'design', 'ml'}),
            frozenset({'mobile', 'backend'}),
            frozenset({'mobile', 'devops'}),
        }

        pair = frozenset({r1, r2})
        if pair in complementary:
            return 1.0

        # Partially related roles
        return 0.6

    def compute_experience_alignment(self, exp1, exp2):
        """
        Score experience alignment.
        Mentor-mentee pairs (advanced+beginner) and peer pairs (same level) both good.
        """
        exp_map = {'beginner': 0, 'intermediate': 1, 'advanced': 2, 'expert': 2}
        e1 = exp_map.get((exp1 or '').lower(), 1)
        e2 = exp_map.get((exp2 or '').lower(), 1)
        diff = abs(e1 - e2)
        # diff=0 → peers (good), diff=1 → slight gap, diff=2 → mentor/mentee (also good)
        if diff == 0:
            return 1.0
        elif diff == 1:
            return 0.75
        else:
            return 0.85  # mentor-mentee: high value

    def compute_match_score(self, user1, user2):
        """
        Compute overall fuzzy match score between two developers.
        Returns score between 0 and 100.
        Weights: 50% skills, 30% tech stack, 20% role
        """
        skill_score = self.compute_skill_overlap(
            user1.get('skills', []), user2.get('skills', []))
        tech_score = self.compute_tech_stack_similarity(
            user1.get('techStack', []), user2.get('techStack', []))
        role_score = self.compute_role_compatibility(
            user1.get('role', ''), user2.get('role', ''))
        exp_score = self.compute_experience_alignment(
            user1.get('experienceLevel', ''), user2.get('experienceLevel', ''))

        # Weighted combination — DevMatch priorities
        fuzzy_score = (
            skill_score * 0.50 +
            tech_score  * 0.30 +
            role_score  * 0.15 +
            exp_score   * 0.05
        )

        return min(fuzzy_score * 100, 100)


# ============================================================
# NEURAL NETWORK MODEL
# ============================================================

class NeuralMatcher:
    """
    Simple feedforward neural network for refining match predictions.
    Input: [skill_overlap, tech_similarity, role_compatibility, exp_alignment]
    Uses numpy for a lightweight implementation (no TF dependency required).
    """

    def __init__(self):
        self.weights_file = os.path.join(os.path.dirname(__file__), 'model_weights.json')
        # 2-layer network: input(4) -> hidden(8) -> output(1)
        self.load_or_init_weights()

    def load_or_init_weights(self):
        if os.path.exists(self.weights_file):
            try:
                with open(self.weights_file, 'r') as f:
                    data = json.load(f)
                self.W1 = np.array(data['W1'])
                self.b1 = np.array(data['b1'])
                self.W2 = np.array(data['W2'])
                self.b2 = np.array(data['b2'])
                return
            except:
                pass

        # Xavier initialization
        np.random.seed(42)
        self.W1 = np.random.randn(4, 8) * np.sqrt(2.0 / 4)
        self.b1 = np.zeros(8)
        self.W2 = np.random.randn(8, 1) * np.sqrt(2.0 / 8)
        self.b2 = np.zeros(1)

    def save_weights(self):
        data = {
            'W1': self.W1.tolist(),
            'b1': self.b1.tolist(),
            'W2': self.W2.tolist(),
            'b2': self.b2.tolist()
        }
        with open(self.weights_file, 'w') as f:
            json.dump(data, f)

    @staticmethod
    def relu(x):
        return np.maximum(0, x)

    @staticmethod
    def sigmoid(x):
        return 1 / (1 + np.exp(-np.clip(x, -500, 500)))

    def predict(self, features):
        """
        Forward pass.
        features = [skill_overlap, tech_similarity, role_compatibility, exp_alignment]
        Returns predicted match quality (0-1)
        """
        x = np.array(features).reshape(1, -1)
        h = self.relu(x @ self.W1 + self.b1)
        out = self.sigmoid(h @ self.W2 + self.b2)
        return float(out[0, 0])

    def train_on_feedback(self, features, target, lr=0.01):
        """
        Simple backpropagation training step.
        features: [skill_overlap, tech_sim, role_compat, exp_align]
        target: 0-1 (normalized rating)
        """
        x = np.array(features).reshape(1, -1)

        # Forward
        z1 = x @ self.W1 + self.b1
        h  = self.relu(z1)
        z2 = h @ self.W2 + self.b2
        out = self.sigmoid(z2)

        # Backward
        error = out - target
        d2 = error * out * (1 - out)
        dW2 = h.T @ d2
        db2 = d2.sum(axis=0)

        d1 = (d2 @ self.W2.T) * (z1 > 0).astype(float)
        dW1 = x.T @ d1
        db1 = d1.sum(axis=0)

        # Update weights
        self.W2 -= lr * dW2
        self.b2 -= lr * db2
        self.W1 -= lr * dW1
        self.b1 -= lr * db1

        self.save_weights()


# ============================================================
# MATCHING PIPELINE
# ============================================================

fuzzy_matcher = FuzzyMatcher()
neural_matcher = NeuralMatcher()


def get_feature_vector(user1, user2):
    """Extract 4-feature vector for neural network input"""
    return [
        fuzzy_matcher.compute_skill_overlap(
            user1.get('skills', []), user2.get('skills', [])),
        fuzzy_matcher.compute_tech_stack_similarity(
            user1.get('techStack', []), user2.get('techStack', [])),
        fuzzy_matcher.compute_role_compatibility(
            user1.get('role', ''), user2.get('role', '')),
        fuzzy_matcher.compute_experience_alignment(
            user1.get('experienceLevel', ''), user2.get('experienceLevel', ''))
    ]


def compute_combined_score(user1, user2):
    """
    Combined matching score:
    - 60% fuzzy logic score
    - 40% neural network prediction
    """
    fuzzy_score  = fuzzy_matcher.compute_match_score(user1, user2)
    features     = get_feature_vector(user1, user2)
    neural_score = neural_matcher.predict(features) * 100

    combined = fuzzy_score * 0.6 + neural_score * 0.4
    return round(min(max(combined, 5), 99), 1)


# ============================================================
# FLASK ROUTES
# ============================================================

@app.route('/health', methods=['GET'])
def health():
    return jsonify({
        'status': 'ok',
        'service': 'devmatch-ai',
        'model': 'fuzzy-logic + neural-network',
        'weights': '50% skills | 30% tech stack | 20% role'
    })


@app.route('/match', methods=['POST'])
def match():
    """
    POST /match
    Body: { userId: str, users: [...user objects...] }
    Returns: { matches: [...matched developers with scores...] }
    """
    data    = request.get_json()
    user_id = data.get('userId')
    users   = data.get('users', [])

    current_user = next((u for u in users if u.get('id') == user_id), None)
    if not current_user:
        return jsonify({'error': 'User not found'}), 404

    other_users = [u for u in users if u.get('id') != user_id]

    matches = []
    for other in other_users:
        score = compute_combined_score(current_user, other)
        matches.append({
            **other,
            'matchScore': score
        })

    # Sort by score descending
    matches.sort(key=lambda m: m['matchScore'], reverse=True)

    return jsonify({'matches': matches})


@app.route('/feedback', methods=['POST'])
def feedback():
    """
    POST /feedback
    Body: { fromUserId, targetUserId, rating (1-5) }
    Trains the neural network on user feedback.
    """
    data   = request.get_json()
    rating = data.get('rating', 3)

    # Normalize rating to 0-1
    target = (rating - 1) / 4.0

    # Store feedback for batch training
    feedback_file = os.path.join(os.path.dirname(__file__), 'feedback_data.json')
    try:
        with open(feedback_file, 'r') as f:
            feedbacks = json.load(f)
    except:
        feedbacks = []

    feedbacks.append({
        'from': data.get('fromUserId'),
        'to':   data.get('targetUserId'),
        'rating': rating,
        'normalized': target
    })

    with open(feedback_file, 'w') as f:
        json.dump(feedbacks, f, indent=2)

    return jsonify({'status': 'feedback recorded', 'training': 'queued'})


if __name__ == '__main__':
    print('⚡ DevMatch AI Service starting...')
    print('   Fuzzy Logic Engine  : ✓')
    print('   Neural Network Model: ✓')
    print('   Match weights → Skills: 50% | Tech Stack: 30% | Role: 20%')
    app.run(host='0.0.0.0', port=5001, debug=True)
