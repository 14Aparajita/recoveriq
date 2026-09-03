import numpy as np
from app.ai.bandit import LinUCB
from app.core.database import SessionLocal

def test_linucb_initialization():
    bandit = LinUCB()
    assert bandit.n_actions == 4
    assert bandit.d == 10

def test_feature_vector():
    # We need a mock event and session
    pass  # Placeholder – you can implement with a dummy event