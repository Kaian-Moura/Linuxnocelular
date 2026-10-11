constexpr unsigned LED_PIN = 23;

void setup() {
  pinMode(LED_PIN, OUTPUT);
  digitalWrite(LED_PIN, LOW);
  Serial.begin(115200);
}

void loop() {
  digitalWrite(LED_PIN, HIGH);
  Serial.println("GPIO23 ligado");
  delay(1000);
  digitalWrite(LED_PIN, LOW);
  Serial.println("GPIO23 desligado");
  delay(1000);
}
