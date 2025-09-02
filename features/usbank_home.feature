Feature: US Bank Homepage
  As a visitor
  I want to verify the US Bank homepage loads and displays main elements

  Scenario: Homepage elements are visible
    Given I am on the US Bank homepage
    Then the header should be visible
    And the footer should be visible
