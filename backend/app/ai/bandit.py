import numpy as np
from sqlalchemy.orm import Session
from ..models.segment_stats import SegmentStat

class LinUCB:
    def __init__(self, n_actions=4, d=10, alpha=1.0):
        self.n_actions = n_actions
        self.d = d
        self.alpha = alpha
        self.A = [np.eye(d) for _ in range(n_actions)]
        self.b = [np.zeros((d, 1)) for _ in range(n_actions)]
        self.theta = [np.zeros((d, 1)) for _ in range(n_actions)]
        self.action_map = ['retry_now', 'retry_later', 'switch_method', 'abandon']

    def feature_vector(self, event, session: Session):
        """Extract features from event and segment stats."""
        amount = np.log(event.amount + 1)
        category_onehot = self._get_category_onehot(event.decline_category)
        stats = session.query(SegmentStat).filter_by(decline_category=event.decline_category).all()
        success_rates = {s.action: s.success_rate for s in stats}
        action_rates = np.array([success_rates.get(a, 0.0) for a in self.action_map])
        x = np.concatenate([[amount], category_onehot, action_rates])
        return x.reshape(-1, 1)

    def _get_category_onehot(self, category):
        categories = ['insufficient_funds', 'issuer_timeout', 'expired_instrument', 'risk_block', 'other']
        arr = np.zeros(len(categories))
        if category in categories:
            arr[categories.index(category)] = 1.0
        return arr

    def select_action(self, x):
        x = x.reshape(-1, 1)
        max_ucb = -np.inf
        best_action = 0
        for a in range(self.n_actions):
            A_inv = np.linalg.inv(self.A[a])
            theta = A_inv @ self.b[a]
            ucb = theta.T @ x + self.alpha * np.sqrt(x.T @ A_inv @ x)
            if ucb > max_ucb:
                max_ucb = ucb
                best_action = a
        return self.action_map[best_action]

    def update(self, action, x, reward):
        a = self.action_map.index(action)
        x = x.reshape(-1, 1)
        self.A[a] += x @ x.T
        self.b[a] += reward * x