def twoSum(n,t): 
    hm = {}
    for i,num in enumerate(n):$
        if t-num in hm:
            return [hm[t-num ],i]
        else:
            hm[num] = i
    return []