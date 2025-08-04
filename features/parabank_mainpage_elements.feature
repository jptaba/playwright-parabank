Feature: Parabank Main Page Element Presence
  As a user or tester
  I want to verify that all main page elements are present and visible
  So that the Parabank landing page is correctly rendered

  Scenario: All main page elements are present
    Given I am on the Parabank main page
    Then all main page elements should be present and visible
