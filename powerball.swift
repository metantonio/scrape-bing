import Foundation
import SwiftSoup

func fetchPowerballInfo() {
    let url = URL(string: "https://www.powerball.com/previous-results?gc=powerball")!

    let task = URLSession.shared.dataTask(with: url) { data, response, error in
        guard let data = data, error == nil else {
            print("Error fetching data: \(error?.localizedDescription ?? "Unknown error")")
            return
        }

        do {
            let html = String(data: data, encoding: .utf8)!
            let document = try SwiftSoup.parse(html)
            let cards = try document.select(".card")
            
            var powerballs = [[String: Any]]()

            for card in cards.array() {
                var powerball = [String: Any]()
                powerball["numbers"] = [String]()
                
                if let powerPlayElement = try? card.select(".multiplier").first() {
                    powerball["power_play"] = try powerPlayElement.text()
                }

                if let dateElement = try? card.select(".card-title").first() {
                    powerball["date"] = try dateElement.text()
                }

                let numberElements = try card.select(".form-control.col.white-balls.item-powerball")
                var numbers = [String]()
                for numberElement in numberElements.array() {
                    numbers.append(try numberElement.text())
                }
                powerball["numbers"] = numbers
                
                if let powerballElement = try? card.select(".form-control.col.powerball.item-powerball").first() {
                    powerball["powerball"] = try powerballElement.text()
                }

                powerballs.append(powerball)
            }
            
            // Convert to JSON
            if let jsonData = try? JSONSerialization.data(withJSONObject: powerballs, options: .prettyPrinted) {
                let jsonString = String(data: jsonData, encoding: .utf8)
                print(jsonString ?? "Failed to create JSON string")
                
                // Save JSON to file
                saveJsonToFile(jsonString: jsonString ?? "")
            }
        } catch {
            print("Error parsing HTML: \(error.localizedDescription)")
        }
    }

    task.resume()
}

func saveJsonToFile(jsonString: String) {
    let fileName = "powerballData.json"
    if let documentDirectory = FileManager.default.urls(for: .documentDirectory, in: .userDomainMask).first {
        let fileURL = documentDirectory.appendingPathComponent(fileName)
        do {
            try jsonString.write(to: fileURL, atomically: true, encoding: .utf8)
            print("File saved: \(fileURL)")
        } catch {
            print("Error saving file: \(error.localizedDescription)")
        }
    }
}
