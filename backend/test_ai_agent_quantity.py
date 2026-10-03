from ai_agent import parse_hinglish_number, sanitize_quantity


def test_parse_hinglish_number_rejects_zero_or_negative_value():
    assert parse_hinglish_number("0", default=7) == 7
    assert parse_hinglish_number("-5", default=7) == 7
    assert parse_hinglish_number("ek", default=7) == 1


def test_sanitize_quantity_keeps_only_positive_numbers():
    assert sanitize_quantity("12.5", default=7) == 12.5
    assert sanitize_quantity("0", default=7) == 7
    assert sanitize_quantity("-2", default=7) == 7
    assert sanitize_quantity("abc", default=7) == 7
