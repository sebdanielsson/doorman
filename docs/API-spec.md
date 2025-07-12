# API Specification for VisionMobile SOAP 1.1 Web Service

## Endpoint

All requests should be sent to the following SOAP 1.1 endpoint:

```plaintext
https://cshub.epr-apps.com/S0144BrfAsen/api/mobile/visionmobile.asmx
```

## Overview

The VisionMobile API provides operations related to booking systems, user management, terminal messages, and more. Authentication is handled via a login GUID (`loginguid`), obtained by calling the `Login` method. This GUID must be provided in subsequent requests requiring authentication.

### **Operations**

Below is a list of available operations, their input parameters, and return types.

---

#### 1. **ApiVersion**

**SOAP Action**: `http://www.rco.se/Api/Mobile/ApiVersion`

**Description**: Retrieves API version information.

**Input Parameters**:

- `apiMin` (string, optional)
- `apiMax` (string, optional)
- `deviceType` (string, optional)
- `appVersion` (string, optional)

**Return Type**:

- `ApiVersionResult` (Array of `anyType`)

---

#### 2. **GetInformetricUrl**

**SOAP Action**: `http://www.rco.se/Api/Mobile/GetInformetricUrl`

**Description**: Retrieves the URL for Informetric services.

**Input Parameters**:

- `loginguid` (string)

**Return Type**:

- `GetInformetricUrlResult` (string)

---

#### 3. **GetBookUnits**

**SOAP Action**: `http://www.rco.se/Api/Mobile/GetBookUnits`

**Description**: Retrieves a list of available booking units for the user.

**Input Parameters**:

- `loginguid` (string)

**Return Type**:

- `GetBookUnitsResult` (Array of `anyType`)

---

#### 4. **ConnectToUnit**

**SOAP Action**: `http://www.rco.se/Api/Mobile/ConnectToUnit`

**Description**: Connects the user to a specific booking unit.

**Input Parameters**:

- `loginguid` (string)
- `unitindex` (long)

**Return Type**:

- `ConnectToUnitResult` (string)

---

#### 5. **GetBookPrechoices**

**SOAP Action**: `http://www.rco.se/Api/Mobile/GetBookPrechoices`

**Description**: Retrieves available pre-choices for booking.

**Input Parameters**:

- `loginguid` (string)

**Return Type**:

- `GetBookPrechoicesResult` (Array of `anyType`)

---

#### 6. **SetBookPrechoises**

**SOAP Action**: `http://www.rco.se/Api/Mobile/SetBookPrechoises`

**Description**: Sets the user's pre-choice for booking.

**Input Parameters**:

- `loginguid` (string)
- `prechoiseindex` (string)

**Return Type**:

- `SetBookPrechoisesResult` (string)

---

#### 7. **GetBookUserBookingCount**

**SOAP Action**: `http://www.rco.se/Api/Mobile/GetBookUserBookingCount`

**Description**: Retrieves the count of the user's bookings.

**Input Parameters**:

- `loginguid` (string)

**Return Type**:

- `GetBookUserBookingCountResult` (string)

---

#### 8. **GetBookUserBookings**

**SOAP Action**: `http://www.rco.se/Api/Mobile/GetBookUserBookings`

**Description**: Retrieves bookings made by the user.

**Input Parameters**:

- `loginguid` (string)
- `bookindex` (long)

**Return Type**:

- `GetBookUserBookingsResult` (Array of `anyType`)

---

#### 9. **DelBookUserBookings**

**SOAP Action**: `http://www.rco.se/Api/Mobile/DelBookUserBookings`

**Description**: Deletes a user's booking.

**Input Parameters**:

- `loginguid` (string)
- `bookindex` (long)

**Return Type**:

- `DelBookUserBookingsResult` (string)

---

#### 10. **GetBookingCalendarDays**

**SOAP Action**: `http://www.rco.se/Api/Mobile/GetBookingCalendarDays`

**Description**: Retrieves booking availability within a date range.

**Input Parameters**:

- `loginguid` (string)
- `startDate` (string)
- `endDate` (string)

**Return Type**:

- `GetBookingCalendarDaysResult` (string)

---

#### 11. **GetAllTerminalMessageLite**

**SOAP Action**: `http://www.rco.se/Api/Mobile/GetAllTerminalMessageLite`

**Description**: Retrieves all terminal messages in a lightweight format.

**Input Parameters**:

- `loginguid` (string)

**Return Type**:

- `GetAllTerminalMessageLiteResult` (Array of `TrmMessageLite`)

**Complex Type**: `TrmMessageLite`

- `MessageId` (int)
- `ContentType` (int)
- `CreatedDate` (dateTime)
- `MessageHeader` (string)
- `RelatedMessageId` (int)
- `TextMessage` (Array of string)
- `HasImage` (boolean)
- `IsHeader` (boolean)
- `RelatedContentType` (int)

---

#### 12. **GetTerminalMessageImage**

**SOAP Action**: `http://www.rco.se/Api/Mobile/GetTerminalMessageImage`

**Description**: Retrieves the image associated with a terminal message.

**Input Parameters**:

- `loginguid` (string)
- `messageId` (int)
- `isHeaderImage` (boolean)

**Return Type**:

- `GetTerminalMessageImageResult` (string, Base64 encoded image)

---

#### 13. **GetOneTerminalMessageLite**

**SOAP Action**: `http://www.rco.se/Api/Mobile/GetOneTerminalMessageLite`

**Description**: Retrieves a specific terminal message.

**Input Parameters**:

- `loginguid` (string)
- `messageId` (int)

**Return Type**:

- `GetOneTerminalMessageLiteResult` (`TrmMessageLite`)

---

#### 14. **GetWebAppAddress**

**SOAP Action**: `http://www.rco.se/Api/Mobile/GetWebAppAddress`

**Description**: Retrieves the web application address.

**Input Parameters**:

- `loginguid` (string)

**Return Type**:

- `GetWebAppAddressResult` (string)

---

#### 15. **GetWebAccess**

**SOAP Action**: `http://www.rco.se/Api/Mobile/GetWebAccess`

**Description**: Retrieves the web access level for the user.

**Input Parameters**:

- `loginGuid` (string)

**Return Type**:

- `GetWebAccessResult` (long)

---

#### 16. **GetSystemDate**

**SOAP Action**: `http://www.rco.se/Api/Mobile/GetSystemDate`

**Description**: Retrieves the current system date.

**Input Parameters**:

- `loginguid` (string)

**Return Type**:

- `GetSystemDateResult` (string)

---

#### 17. **GetShowBooked**

**SOAP Action**: `http://www.rco.se/Api/Mobile/GetShowBooked`

**Description**: Indicates whether booked items should be displayed.

**Input Parameters**:

- `loginguid` (string)

**Return Type**:

- `GetShowBookedResult` (string)

---

#### 18. **Logout**

**SOAP Action**: `http://www.rco.se/Api/Mobile/Logout`

**Description**: Logs out the user, invalidating the `loginguid`.

**Input Parameters**:

- `loginguid` (string)

**Return Type**:

- `LogoutResult` (string)

---

#### 19. **Login**

**SOAP Action**: `http://www.rco.se/Api/Mobile/Login`

**Description**: Authenticates a user and returns a session `loginguid`.

**Input Parameters**:

- `systemname` (string)
- `username` (string)
- `Password` (string)
- `timeout` (int)

**Return Type**:

- `LoginResult` (string, `loginguid`)

---

#### 20. **GetBookMachineGroupTypes**

**SOAP Action**: `http://www.rco.se/Api/Mobile/GetBookMachineGroupTypes`

**Description**: Retrieves available machine group types for booking.

**Input Parameters**:

- `loginguid` (string)

**Return Type**:

- `GetBookMachineGroupTypesResult` (Array of `anyType`)

---

#### 21. **SetBookMachineGroupTypes**

**SOAP Action**: `http://www.rco.se/Api/Mobile/SetBookMachineGroupTypes`

**Description**: Sets the machine group type for booking.

**Input Parameters**:

- `loginguid` (string)
- `typeindex` (string)

**Return Type**:

- `SetBookMachineGroupTypesResult` (string)

---

#### 22. **GetNextBookMachineGroups**

**SOAP Action**: `http://www.rco.se/Api/Mobile/GetNextBookMachineGroups`

**Description**: Retrieves the next available machine groups for booking.

**Input Parameters**:

- `loginguid` (string)

**Return Type**:

- `GetNextBookMachineGroupsResult` (Array of `anyType`)

---

#### 23. **GetBookMachineGroupsFree**

**SOAP Action**: `http://www.rco.se/Api/Mobile/GetBookMachineGroupsFree`

**Description**: Retrieves machine groups that are currently free for booking.

**Input Parameters**:

- `loginguid` (string)

**Return Type**:

- `GetBookMachineGroupsFreeResult` (Array of `anyType`)

---

#### 24. **GetBookMachineGroupsCountersLeft**

**SOAP Action**: `http://www.rco.se/Api/Mobile/GetBookMachineGroupsCountersLeft`

**Description**: Retrieves counters for remaining bookings in machine groups.

**Input Parameters**:

- `loginguid` (string)

**Return Type**:

- `GetBookMachineGroupsCountersLeftResult` (Array of `anyType`)

---

#### 25. **GetBookRandomMachineGroup**

**SOAP Action**: `http://www.rco.se/Api/Mobile/GetBookRandomMachineGroup`

**Description**: Retrieves a random machine group for booking.

**Input Parameters**:

- `loginguid` (string)

**Return Type**:

- `GetBookRandomMachineGroupResult` (string)

---

#### 26. **SetBookMachineGroup**

**SOAP Action**: `http://www.rco.se/Api/Mobile/SetBookMachineGroup`

**Description**: Sets a specific machine group for booking.

**Input Parameters**:

- `loginguid` (string)
- `machinegroupindex` (string)

**Return Type**:

- `SetBookMachineGroupResult` (Array of `anyType`)

---

#### 27. **SetBookPass**

**SOAP Action**: `http://www.rco.se/Api/Mobile/SetBookPass`

**Description**: Sets the booking pass for a machine group.

**Input Parameters**:

- `loginguid` (string)
- `SystemDate` (string)
- `passindex` (string)

**Return Type**:

- `SetBookPassResult` (string)

---

#### 28. **GetCardgroupNameBookMachineGroupsFree**

**SOAP Action**: `http://www.rco.se/Api/Mobile/GetCardgroupNameBookMachineGroupsFree`

**Description**: Retrieves names of card groups with free machine groups.

**Input Parameters**:

- `loginguid` (string)

**Return Type**:

- `GetCardgroupNameBookMachineGroupsFreeResult` (Array of `anyType`)

---

#### 29. **GetUserData**

**SOAP Action**: `http://www.rco.se/Api/Mobile/GetUserData`

**Description**: Retrieves user data, including units and permissions.

**Input Parameters**:

- `loginguid` (string)

**Return Type**:

- `GetUserDataResult` (Array of `anyType`)

---

#### 30. **GetSystemName**

**SOAP Action**: `http://www.rco.se/Api/Mobile/GetSystemName`

**Description**: Retrieves the name of the system.

**Input Parameters**:

- None

**Return Type**:

- `GetSystemNameResult` (string)

---

#### 31. **GetUserBalance**

**SOAP Action**: `http://www.rco.se/Api/Mobile/GetUserBalance`

**Description**: Retrieves the user's account balance.

**Input Parameters**:

- `loginguid` (string)

**Return Type**:

- `GetUserBalanceResult` (string)

---

#### 32. **GetBookUserInfo**

**SOAP Action**: `http://www.rco.se/Api/Mobile/GetBookUserInfo`

**Description**: Retrieves booking-related information about the user.

**Input Parameters**:

- `loginguid` (string)

**Return Type**:

- `GetBookUserInfoResult` (Array of `anyType`)

---

#### 33. **GetMachineGroups**

**SOAP Action**: `http://www.rco.se/Api/Mobile/GetMachineGroups`

**Description**: Retrieves machine groups available to the user, along with their status.

**Input Parameters**:

- `loginGuid` (string)

**Return Type**:

- `GetMachineGroupsResult` (Array of `SelectionObjectsAndObjectStatus`)

**Complex Types**:

- **SelectionObjectsAndObjectStatus**
  - `Selection` (`Selection`)
  - `BookObjects` (Array of `BookableObjects`)

- **Selection**
  - `Number` (int)
  - `Name` (string)
  - `Type` (int)
  - `FkConNr` (int)
  - `Units` (string)
  - `Options` (string)
  - `Owner` (int)
  - `RaSystem` (int)
  - `AllocStatus` (int)
  - `BookMaxObjects` (int)
  - `BookMaxPeriods` (int)
  - `BookPrimary` (int)
  - `BookMaxDays` (int)
  - `FkFolder` (int)
  - `SymbolId` (int)
  - _Additional optional fields: `Field1` to `Field5`, `RaStamp`, `RaSecurityField`, `RaSecurityGroups`_

- **BookableObjects**
  - `BookObject` (`ZBookObject`)
  - `MachineStatus` (Array of `Machine`)

- **ZBookObject**
  - `PkObject` (int)
  - `Name` (string)
  - `FkObjectType` (int)
  - `Unit` (int)
  - `FkConNr` (int)
  - `AllocStatus` (int)
  - `RaSystem` (int)
  - `FkDEBPriceList` (int)
  - `BookedByMe` (boolean)
  - `GroupStatus` (int)
  - _Additional optional fields: `Options`, `Cmis`, `RaStamp`, `RaSecurityField`, `RaSecurityGroups`_

- **Machine**
  - `MachineText` (string)
  - `MachineName` (string)
  - `MachineNumber` (int)
  - `Status` (string)
  - `ReadyTime` (string)
  - `StartTime` (string)

---

### **Authentication**

- Obtain a `loginguid` by calling the `Login` method with valid credentials.
- Include the `loginguid` in subsequent requests requiring authentication.
- Use the `Logout` method to invalidate the `loginguid` when done.

---

### **Data Types**

- **string**: Textual data.
- **int**: Integer number.
- **long**: Large integer number.
- **boolean**: `true` or `false`.
- **dateTime**: Date and time in ISO 8601 format.
- **Array of anyType**: An array with elements of unspecified types.
- **Array of string**: An array containing strings.

---

### **Notes**

- **Optional Parameters**: Parameters specified as optional may not be required for all requests.
- **Dates**: Ensure date strings are formatted according to the expected format (typically `YYYY-MM-DD` or ISO 8601).
- **Response Parsing**: Responses, especially those returning `Array of anyType`, may require testing to understand the exact structure.

---

**Example Usage**

1. **Login**:
   - Call `Login` with `systemname`, `username`, `Password`, and `timeout` to receive a `loginguid`.

2. **Retrieve Bookings**:
   - Use `GetBookUserBookings` with `loginguid` and `bookindex` to get user's bookings.

3. **Book a Machine Group**:
   - Set the machine group type using `SetBookMachineGroupTypes`.
   - Select a machine group with `SetBookMachineGroup`.
   - Set the booking pass via `SetBookPass`.

4. **Logout**:
   - Call `Logout` with `loginguid` to end the session.
