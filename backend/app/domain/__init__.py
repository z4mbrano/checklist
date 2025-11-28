"""
Domain Layer - Entities Package

This layer contains pure business entities independent of any framework.
Entities encapsulate critical business rules and state transitions.

Architecture Decision Record (ADR):
- No SQLAlchemy imports - domain is framework-agnostic
- Rich domain model with behavior, not anemic data containers
- Immutability where possible (dataclasses with frozen=True for value objects)
- Business invariants enforced in entity methods
"""
