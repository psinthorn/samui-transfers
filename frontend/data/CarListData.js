import { Luggage } from "lucide-react";

export const CarListData = [

        {
          ID: 1,
          type: "SUV",
          model: "Toyota Fortuner",
          desc: "SUV car with 4 seats hight performance and luxury interior",
          seat: 3,
          rate: [
            350,
            35,
            29,
          ],
          Luggage: 6,
          extra_charge: 200, 
          image: '/toyota-fortuner-transparent.png',
          status: "available",
        },
        {
          ID: 2,
          type: "Mini Bus",
          model: "Toyota Commuter",
          desc: "Mini Bus with 7 seats hight roof comfortable seating and space for luggage",
          seat: 6,
          rate: [
            500,
            45,
            39,
          ],
          extra_charge: 300, 
           Luggage: 9,
          image: '/toyota-commuter.png',
          status: "available",
        },
       
];

// Rate explanation
// The rate is calculated based on the distance and the type of vehicle selected. Each vehicle has a base rate and additional charges may apply depending on the distance and other factors.

// The rates are structured as follows:
// - Base rate: The initial cost for the selected vehicle type
// - Distance rate: An additional charge per kilometer/mile traveled
// - Time rate: An additional charge per minute/hour of travel time