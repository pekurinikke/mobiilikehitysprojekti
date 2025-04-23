using UnityEngine;
using UnityEngine.UI;

public class UIManager : MonoBehaviour
{
    private static UIManager _instance;

    public static UIManager Instance
    {
        get
        {
            if (_instance == null)
            {
                Debug.LogError("UIManager is null");
            }
            return _instance;
        }
    }

    public Text coinText;

    // Awake is called when the script instance is being loaded
    void Awake()
    {
        _instance = this; // Corrected to _instance
    }


    public void UpdateCoinText(int coins)
    {
        coinText.text = "Coins: " + coins;
    }
    
    // Start is called before the first frame update
    void Start()
    {
        
    }

    // Update is called once per frame
    void Update()
    {
        
    }
}
