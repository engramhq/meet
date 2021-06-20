//
//  LoginViewModel.swift
//  engram
//
//  Created by Adam Berg on 2021-06-20.
//

import Foundation

let sharedLoginViewModel = LoginViewModel()

struct LoginDataDecodable: Decodable {
    var errors: [String]?
}

class LoginViewModel: ObservableObject {
    @Published var loggedIn = false
    @Published var hasLoginError = false
    @Published var hasSignupError = false
    @Published var loginError: String = ""
    @Published var signupError: String = ""
    
    init() {
//        fetchMe()
    }
    
    func fetchMe() {
        let url = URL(string: "https://engram.xyzdigital.com/api/users/me")!
        var request = URLRequest(url: url)
        request.setValue("application/json; charset=utf-8", forHTTPHeaderField: "Content-Type")
        request.setValue("application/json; charset=utf-8", forHTTPHeaderField: "Accept")
        let session = URLSession.shared
        let task = session.dataTask(with: request) { (data, response, error) in

            if let error = error {
                print(error)
            } else if data != nil {
                DispatchQueue.main.async {
                    if let httpResponse = response as? HTTPURLResponse {
                        if httpResponse.statusCode == 200 {
                            self.loggedIn = true
                        } else {
                            self.loggedIn = false
                        }
                    }
                }
                
            } else {
                // Handle unexpected error
            }
        }
        task.resume()
    }
    
    func login(email: String, password: String) {
        let url = URL(string: "https://engram.xyzdigital.com/api/users/login")!
        var request = URLRequest(url: url)
        request.setValue("application/json; charset=utf-8", forHTTPHeaderField: "Content-Type")
        request.setValue("application/json; charset=utf-8", forHTTPHeaderField: "Accept")
        
        let bodyData = try? JSONSerialization.data(
            withJSONObject: ["username": email, "password": password],
            options: []
        )

        request.httpMethod = "POST"
        request.httpBody = bodyData
        
        let session = URLSession.shared
        let task = session.dataTask(with: request) { (data, response, error) in

            if let error = error {
                print(error)
            } else if let data = data {
                DispatchQueue.main.async {
                    if let httpResponse = response as? HTTPURLResponse {
                        if httpResponse.statusCode == 200 {
                            self.loggedIn = true
                        } else {
                            let decoder = JSONDecoder()
                            let decoded = try! decoder.decode(LoginDataDecodable.self, from: data)
                            
                            self.loginError = decoded.errors!.joined(separator: " ")
                            self.hasLoginError = true
                        }
                    }
                }
            } else {
                // Handle unexpected error
            }
        }
        task.resume()
    }
    
    func signup(email: String, password: String) {
        let url = URL(string: "https://engram.xyzdigital.com/api/users/signup")!
        var request = URLRequest(url: url)
        request.setValue("application/json; charset=utf-8", forHTTPHeaderField: "Content-Type")
        request.setValue("application/json; charset=utf-8", forHTTPHeaderField: "Accept")
        
        let bodyData = try? JSONSerialization.data(
            withJSONObject: ["email": email, "password": password],
            options: []
        )

        request.httpMethod = "POST"
        request.httpBody = bodyData
        
        let session = URLSession.shared
        let task = session.dataTask(with: request) { (data, response, error) in

            if let error = error {
                print(error)
            } else if let data = data {
                DispatchQueue.main.async {
                    if let httpResponse = response as? HTTPURLResponse {
                        if httpResponse.statusCode == 200 {
                            self.loggedIn = true
                        } else {
                            let decoder = JSONDecoder()
                            let decoded = try! decoder.decode(LoginDataDecodable.self, from: data)
                            
                            self.signupError = decoded.errors!.joined(separator: " ")
                            self.hasSignupError = true
                        }
                    }
                }
            } else {
                // Handle unexpected error
            }
        }
        task.resume()
    }
}
